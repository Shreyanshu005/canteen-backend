"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentLinkDetails = exports.getPaymentDetails = exports.verifyWebhookSignature = exports.verifyPaymentSignature = exports.createPaymentLink = void 0;
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
 * Create a Razorpay Payment Link
 */
const createPaymentLink = async (orderId, amount, customerName, customerEmail, customerPhone) => {
    try {
        const razorpay = getRazorpayInstance();
        const paymentLinkData = {
            amount: amount * 100, // Convert to paise (₹1 = 100 paise)
            currency: 'INR',
            description: `Payment for Order ${orderId}`,
            customer: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone,
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,
            callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
            callback_method: 'get',
            reference_id: orderId, // Our order ID for reference
        };
        const paymentLink = await razorpay.paymentLink.create(paymentLinkData);
        return paymentLink;
    }
    catch (error) {
        console.error('Razorpay payment link creation error:', error);
        throw new Error('Failed to create payment link');
    }
};
exports.createPaymentLink = createPaymentLink;
/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            throw new Error('Razorpay secret key not configured');
        }
        // Create signature string
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
 * Get payment link details
 */
const getPaymentLinkDetails = async (paymentLinkId) => {
    try {
        const razorpay = getRazorpayInstance();
        const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);
        return paymentLink;
    }
    catch (error) {
        console.error('Error fetching payment link details:', error);
        throw new Error('Failed to fetch payment link details');
    }
};
exports.getPaymentLinkDetails = getPaymentLinkDetails;
exports.default = {
    createPaymentLink: exports.createPaymentLink,
    verifyPaymentSignature: exports.verifyPaymentSignature,
    verifyWebhookSignature: exports.verifyWebhookSignature,
    getPaymentDetails: exports.getPaymentDetails,
    getPaymentLinkDetails: exports.getPaymentLinkDetails,
};
//# sourceMappingURL=razorpay.js.map