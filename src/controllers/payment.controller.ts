import type { Request, Response } from 'express';
import Order from '../models/Order';
import Payment from '../models/Payment';
import User from '../models/User';
import { createCashfreeOrder, getPaymentDetails } from '../utils/cashfree';
import { generateOrderQR } from '../utils/qrGenerator';

// @desc    Initiate payment for an order
// @route   POST /api/v1/payments/initiate
// @access  Private
export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, error: 'Order ID is required' });
        }

        // Find order
        const order = await Order.findById(orderId);
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

        // Get user details
        const user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if payment already exists for this order
        let payment = await Payment.findOne({ orderId: order._id });

        if (!payment) {
            // Create Cashfree order
            // TypeScript workaround: email is required in User model but TS doesn't know that
            const email: string = user.email || '';
            const customerName = email.split('@')[0] || 'Customer';
            const cashfreeOrder = await createCashfreeOrder(
                order.orderId,
                order.totalAmount,
                customerName,
                email,
                '9999999999' // Default phone, can be updated when User model has phone field
            );

            // Create payment record
            payment = await Payment.create({
                orderId: order._id,
                cashfreeOrderId: order.orderId,
                paymentSessionId: cashfreeOrder.payment_session_id,
                amount: order.totalAmount,
                status: 'initiated',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                paymentSessionId: payment.paymentSessionId,
                orderId: order.orderId,
                amount: order.totalAmount,
            },
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

// @desc    Verify payment after redirect from Cashfree
// @route   POST /api/v1/payments/verify
// @access  Private
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, error: 'Order ID is required' });
        }

        // Find order by orderId (not _id)
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check if user owns this order
        if (order.userId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // Get payment details from Cashfree
        const paymentDetails = await getPaymentDetails(orderId);

        if (!paymentDetails || paymentDetails.length === 0) {
            return res.status(400).json({ success: false, error: 'No payment found for this order' });
        }

        const latestPayment = paymentDetails[0];

        // Update payment record
        const payment = await Payment.findOne({ orderId: order._id });
        if (payment) {
            payment.status = latestPayment.payment_status === 'SUCCESS' ? 'success' : 'failed';
            payment.transactionId = latestPayment.cf_payment_id;
            payment.paymentMethod = latestPayment.payment_group;
            await payment.save();
        }

        // Update order
        if (latestPayment.payment_status === 'SUCCESS') {
            order.paymentStatus = 'success';
            order.status = 'paid';
            order.paymentId = latestPayment.cf_payment_id;

            // Generate QR code
            const qrCode = await generateOrderQR(order.orderId);
            order.qrCode = qrCode;

            await order.save();

            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: order,
            });
        } else {
            order.paymentStatus = 'failed';
            await order.save();

            return res.status(400).json({
                success: false,
                error: 'Payment failed',
                data: order,
            });
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

// @desc    Handle Cashfree webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (but verified)
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const webhookData = req.body;

        console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

        // Verify webhook signature
        const signature = req.headers['x-webhook-signature'] as string;
        const timestamp = req.headers['x-webhook-timestamp'] as string;

        // TODO: Implement signature verification
        // For now, we'll process the webhook

        const { order_id, payment_status, cf_payment_id, payment_group } = webhookData.data || {};

        if (!order_id) {
            return res.status(400).json({ success: false, error: 'Invalid webhook data' });
        }

        // Find order
        const order = await Order.findOne({ orderId: order_id });
        if (!order) {
            console.error(`Order not found for webhook: ${order_id}`);
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Update payment record
        const payment = await Payment.findOne({ orderId: order._id });
        if (payment) {
            payment.status = payment_status === 'SUCCESS' ? 'success' : 'failed';
            payment.transactionId = cf_payment_id;
            payment.paymentMethod = payment_group;
            await payment.save();
        }

        // Update order
        if (payment_status === 'SUCCESS') {
            order.paymentStatus = 'success';
            order.status = 'paid';
            order.paymentId = cf_payment_id;

            // Generate QR code if not already generated
            if (!order.qrCode) {
                const qrCode = await generateOrderQR(order.orderId);
                order.qrCode = qrCode;
            }

            await order.save();
            console.log(`Order ${order_id} marked as paid`);
        } else {
            order.paymentStatus = 'failed';
            await order.save();
            console.log(`Order ${order_id} payment failed`);
        }

        // Respond to Cashfree
        res.status(200).json({ success: true });
    } catch (err: any) {
        console.error('Webhook error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
