"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPayment = exports.getRazorpayOrderDetails = exports.getPaymentDetails = exports.verifyWebhookSignature = exports.verifyPaymentSignature = exports.createRazorpayOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Initialize Razorpay instance
 */
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured');
    }
    return new razorpay_1.default({
        key_id: keyId,
        key_secret: keySecret,
    });
};
/**
 * Create a Razorpay Order (for Standard Checkout)
 */
const createRazorpayOrder = async (orderId, amount, receipt) => {
    try {
        const razorpay = getRazorpayInstance();
        const orderData = {
            amount: amount * 100, // Convert to paise (₹1 = 100 paise)
            currency: 'INR',
            receipt: receipt || orderId, // Use our order ID as receipt
            payment_capture: 1, // Auto capture payment
        };
        const razorpayOrder = await razorpay.orders.create(orderData);
        return razorpayOrder;
    }
    catch (error) {
        console.error('Razorpay order creation error:', error);
        throw new Error('Failed to create Razorpay order');
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            throw new Error('Razorpay secret key not configured');
        }
        // Create signature string: order_id|payment_id
        const signatureData = `${razorpayOrderId}|${razorpayPaymentId}`;
        // Generate expected signature
        const expectedSignature = crypto_1.default
            .createHmac('sha256', keySecret)
            .update(signatureData)
            .digest('hex');
        return razorpaySignature === expectedSignature;
    }
    catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};
exports.verifyPaymentSignature = verifyPaymentSignature;
/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (webhookBody, webhookSignature) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error('Razorpay webhook secret not configured');
        }
        const expectedSignature = crypto_1.default
            .createHmac('sha256', webhookSecret)
            .update(webhookBody)
            .digest('hex');
        return webhookSignature === expectedSignature;
    }
    catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
};
exports.verifyWebhookSignature = verifyWebhookSignature;
/**
 * Get payment details from Razorpay
 */
const getPaymentDetails = async (paymentId) => {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    }
    catch (error) {
        console.error('Error fetching payment details:', error);
        throw new Error('Failed to fetch payment details');
    }
};
exports.getPaymentDetails = getPaymentDetails;
/**
 * Get order details from Razorpay
 */
const getRazorpayOrderDetails = async (razorpayOrderId) => {
    try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.fetch(razorpayOrderId);
        return order;
    }
    catch (error) {
        console.error('Error fetching order details:', error);
        throw new Error('Failed to fetch order details');
    }
};
exports.getRazorpayOrderDetails = getRazorpayOrderDetails;
/**
 * Refund a payment
 */
const refundPayment = async (paymentId, amount) => {
    try {
        const razorpay = getRazorpayInstance();
        // Amount must be in paise
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount * 100,
            speed: 'normal',
        });
        return refund;
    }
    catch (error) {
        console.error('Razorpay refund error:', error);
        throw new Error('Failed to refund payment');
    }
};
exports.refundPayment = refundPayment;
exports.default = {
    createRazorpayOrder: exports.createRazorpayOrder,
    verifyPaymentSignature: exports.verifyPaymentSignature,
    verifyWebhookSignature: exports.verifyWebhookSignature,
    getPaymentDetails: exports.getPaymentDetails,
    getRazorpayOrderDetails: exports.getRazorpayOrderDetails,
    refundPayment: exports.refundPayment,
};
//# sourceMappingURL=razorpay.js.map