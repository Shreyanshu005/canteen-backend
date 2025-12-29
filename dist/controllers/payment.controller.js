"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.verifyPayment = exports.initiatePayment = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Payment_1 = __importDefault(require("../models/Payment"));
const razorpay_1 = require("../utils/razorpay");
const orderFulfillment_service_1 = require("../services/orderFulfillment.service");
// @desc    Initiate payment for an order
// @route   POST /api/v1/payments/initiate
// @access  Private
const initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, error: 'Order ID is required' });
        }
        // Find order by either MongoDB _id or orderId field
        let order;
        if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a MongoDB ObjectId
            order = await Order_1.default.findById(orderId);
        }
        else {
            // It's our custom orderId (e.g., ORD-XXX)
            order = await Order_1.default.findOne({ orderId: orderId });
        }
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check if user owns this order
        if (order.userId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        // Check if order is already paid
        if (order.paymentStatus === 'success') {
            return res.status(400).json({ success: false, error: 'Order is already paid' });
        }
        // Check if order is cancelled
        if (order.status === 'cancelled') {
            return res.status(400).json({ success: false, error: 'Cannot pay for cancelled order' });
        }
        // Check if Razorpay order already exists for this order
        let payment = await Payment_1.default.findOne({ orderId: order._id });
        if (!payment || payment.status === 'failed') {
            // Create Razorpay order
            const razorpayOrder = await (0, razorpay_1.createRazorpayOrder)(order.orderId, order.totalAmount, order.orderId);
            // Create or update payment record
            if (payment) {
                payment.razorpayOrderId = razorpayOrder.id;
                payment.status = 'initiated';
                await payment.save();
            }
            else {
                payment = await Payment_1.default.create({
                    orderId: order._id,
                    razorpayOrderId: razorpayOrder.id,
                    amount: order.totalAmount,
                    status: 'initiated',
                });
            }
            return res.status(200).json({
                success: true,
                data: {
                    razorpayOrderId: razorpayOrder.id,
                    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    orderId: order.orderId,
                },
            });
        }
        // Return existing Razorpay order
        res.status(200).json({
            success: true,
            data: {
                razorpayOrderId: payment.razorpayOrderId,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID,
                amount: payment.amount * 100,
                currency: 'INR',
                orderId: order.orderId,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};
exports.initiatePayment = initiatePayment;
// @desc    Verify payment after checkout
// @route   POST /api/v1/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({
                success: false,
                error: 'Order ID, Payment ID, and Signature are required'
            });
        }
        // Verify signature
        const isValid = (0, razorpay_1.verifyPaymentSignature)(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment signature'
            });
        }
        // Find payment by Razorpay order ID
        const payment = await Payment_1.default.findOne({ razorpayOrderId });
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        // Find order
        const order = await Order_1.default.findById(payment.orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check if user owns this order
        if (order.userId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        // Get payment details from Razorpay
        const paymentDetails = await (0, razorpay_1.getPaymentDetails)(razorpayPaymentId);
        // Fulfill the order using the shared service
        const updatedOrder = await (0, orderFulfillment_service_1.fulfillOrder)(razorpayOrderId, razorpayPaymentId, paymentDetails.method);
        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: updatedOrder,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};
exports.verifyPayment = verifyPayment;
// @desc    Handle Razorpay webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (but verified)
const handleWebhook = async (req, res) => {
    try {
        console.log('🚀 Webhook hit! Method:', req.method, 'Headers:', JSON.stringify(req.headers['x-razorpay-signature']));
        const webhookBody = req.rawBody || JSON.stringify(req.body);
        const webhookSignature = req.headers['x-razorpay-signature'];
        console.log('Webhook received:', JSON.stringify(req.body, null, 2));
        // Verify webhook signature
        const isValid = (0, razorpay_1.verifyWebhookSignature)(webhookBody, webhookSignature);
        if (!isValid) {
            console.error('Invalid webhook signature');
            return res.status(400).json({ success: false, error: 'Invalid signature' });
        }
        const event = req.body.event;
        console.log(`🔔 Processing event: ${event}`);
        // Handle payment.captured OR order.paid
        if (event === 'payment.captured' || event === 'order.paid') {
            let razorpayOrderId;
            let razorpayPaymentId = 'N/A';
            let paymentMethod = 'unknown';
            if (event === 'payment.captured') {
                const paymentEntity = req.body.payload?.payment?.entity;
                if (!paymentEntity)
                    return res.status(400).json({ success: false, error: 'Invalid payload' });
                razorpayPaymentId = paymentEntity.id;
                razorpayOrderId = paymentEntity.order_id;
                paymentMethod = paymentEntity.method;
            }
            else {
                // order.paid
                const orderEntity = req.body.payload?.order?.entity;
                if (!orderEntity)
                    return res.status(400).json({ success: false, error: 'Invalid payload' });
                razorpayOrderId = orderEntity.id;
                // For order.paid, we don't always get the payment ID directly in the entity, 
                // but fulfillOrder handles the core logic.
            }
            console.log(`Processing fulfillment for Razorpay Order: ${razorpayOrderId}`);
            // Fulfill order via shared service
            await (0, orderFulfillment_service_1.fulfillOrder)(razorpayOrderId, razorpayPaymentId, paymentMethod);
        }
        // Handle payment.failed event
        if (event === 'payment.failed') {
            const failedRazorpayOrderId = req.body.payload?.payment?.entity?.order_id;
            if (failedRazorpayOrderId) {
                const payment = await Payment_1.default.findOne({ razorpayOrderId: failedRazorpayOrderId });
                if (payment) {
                    payment.status = 'failed';
                    await payment.save();
                    const order = await Order_1.default.findById(payment.orderId);
                    if (order) {
                        order.paymentStatus = 'failed';
                        await order.save();
                        console.log(`Order ${order.orderId} payment failed`);
                    }
                }
            }
        }
        // Respond to Razorpay
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.handleWebhook = handleWebhook;
//# sourceMappingURL=payment.controller.js.map