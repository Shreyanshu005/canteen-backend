// @ts-nocheck - Cashfree SDK types are defined in src/types/cashfree.d.ts
import { Cashfree } from 'cashfree-pg';

/**
 * Create a Cashfree order for payment
 */
export const createCashfreeOrder = async (
    orderId: string,
    amount: number,
    customerName: string,
    customerEmail: string,
    customerPhone: string
) => {
    try {
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'TEST';

        if (!appId || !secretKey) {
            throw new Error('Cashfree credentials not configured');
        }

        // Initialize Cashfree
        Cashfree.XClientId = appId;
        Cashfree.XClientSecret = secretKey;
        Cashfree.XEnvironment = env === 'PROD' ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

        const request = {
            order_id: orderId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
                customer_id: customerEmail,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/payment/callback?order_id=${orderId}`,
                notify_url: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/v1/payments/webhook`,
            },
        };

        const response = await Cashfree.PGCreateOrder('2023-08-01', request);
        return response.data;
    } catch (error: any) {
        console.error('Cashfree order creation error:', error.response?.data || error.message);
        throw new Error('Failed to create payment order');
    }
};

/**
 * Verify payment signature from Cashfree
 */
export const verifyPaymentSignature = (
    orderId: string,
    orderAmount: string,
    signature: string,
    timestamp: string
): boolean => {
    try {
        const crypto = require('crypto');
        const secretKey = process.env.CASHFREE_SECRET_KEY;

        if (!secretKey) {
            throw new Error('Cashfree secret key not configured');
        }

        // Create signature string
        const signatureData = `${orderId}${orderAmount}${timestamp}`;

        // Generate expected signature
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(signatureData)
            .digest('base64');

        return signature === expectedSignature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

/**
 * Get payment details from Cashfree
 */
export const getPaymentDetails = async (orderId: string) => {
    try {
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'TEST';

        if (!appId || !secretKey) {
            throw new Error('Cashfree credentials not configured');
        }

        // Initialize Cashfree
        Cashfree.XClientId = appId;
        Cashfree.XClientSecret = secretKey;
        Cashfree.XEnvironment = env === 'PROD' ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

        const response = await Cashfree.PGOrderFetchPayments('2023-08-01', orderId);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching payment details:', error.response?.data || error.message);
        throw new Error('Failed to fetch payment details');
    }
};

export { Cashfree };
