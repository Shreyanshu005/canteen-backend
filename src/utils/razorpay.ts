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
 * Create a Razorpay Payment Link
 */
export const createPaymentLink = async (
    orderId: string,
    amount: number,
    customerName: string,
    customerEmail: string,
    customerPhone: string
) => {
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
    } catch (error: any) {
        console.error('Razorpay payment link creation error:', error);
        throw new Error('Failed to create payment link');
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

        // Create signature string
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
 * Get payment link details
 */
export const getPaymentLinkDetails = async (paymentLinkId: string) => {
    try {
        const razorpay = getRazorpayInstance();
        const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);
        return paymentLink;
    } catch (error: any) {
        console.error('Error fetching payment link details:', error);
        throw new Error('Failed to fetch payment link details');
    }
};

export default {
    createPaymentLink,
    verifyPaymentSignature,
    verifyWebhookSignature,
    getPaymentDetails,
    getPaymentLinkDetails,
};
