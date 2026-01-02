import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Initialize Razorpay instance
 */
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured');
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

/**
 * Create a Razorpay Order (for Standard Checkout)
 */
export const createRazorpayOrder = async (
    orderId: string,
    amount: number,
    receipt?: string
) => {
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
    } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        throw new Error('Failed to create Razorpay order');
    }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): boolean => {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keySecret) {
            throw new Error('Razorpay secret key not configured');
        }

        // Create signature string: order_id|payment_id
        const signatureData = `${razorpayOrderId}|${razorpayPaymentId}`;

        // Generate expected signature
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(signatureData)
            .digest('hex');

        return razorpaySignature === expectedSignature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
    webhookBody: string,
    webhookSignature: string
): boolean => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            throw new Error('Razorpay webhook secret not configured');
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(webhookBody)
            .digest('hex');

        return webhookSignature === expectedSignature;
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
};

/**
 * Get payment details from Razorpay
 */
export const getPaymentDetails = async (paymentId: string) => {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error: any) {
        console.error('Error fetching payment details:', error);
        throw new Error('Failed to fetch payment details');
    }
};

/**
 * Get order details from Razorpay
 */
export const getRazorpayOrderDetails = async (razorpayOrderId: string) => {
    try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.fetch(razorpayOrderId);
        return order;
    } catch (error: any) {
        console.error('Error fetching order details:', error);
        throw new Error('Failed to fetch order details');
    }
};

/**
 * Refund a payment
 */
export const refundPayment = async (paymentId: string, amount: number) => {
    try {
        const razorpay = getRazorpayInstance();
        // Amount must be in paise
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount * 100,
            speed: 'normal',
        });
        return refund;
    } catch (error: any) {
        console.error('Razorpay refund error:', error);
        throw new Error('Failed to refund payment');
    }
};

export default {
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    getPaymentDetails,
    getRazorpayOrderDetails,
    refundPayment,
};
