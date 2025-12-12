"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cashfree = exports.getPaymentDetails = exports.verifyPaymentSignature = exports.createCashfreeOrder = void 0;
const cashfree_pg_1 = require("cashfree-pg");
Object.defineProperty(exports, "Cashfree", { enumerable: true, get: function () { return cashfree_pg_1.Cashfree; } });
/**
 * Create a Cashfree order for payment
 */
const createCashfreeOrder = async (orderId, amount, customerName, customerEmail, customerPhone) => {
    try {
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'TEST';
        if (!appId || !secretKey) {
            throw new Error('Cashfree credentials not configured');
        }
        // Initialize Cashfree
        cashfree_pg_1.Cashfree.XClientId = appId;
        cashfree_pg_1.Cashfree.XClientSecret = secretKey;
        cashfree_pg_1.Cashfree.XEnvironment = env === 'PROD' ? cashfree_pg_1.Cashfree.Environment.PRODUCTION : cashfree_pg_1.Cashfree.Environment.SANDBOX;
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
        const response = await cashfree_pg_1.Cashfree.PGCreateOrder('2023-08-01', request);
        return response.data;
    }
    catch (error) {
        console.error('Cashfree order creation error:', error.response?.data || error.message);
        throw new Error('Failed to create payment order');
    }
};
exports.createCashfreeOrder = createCashfreeOrder;
/**
 * Verify payment signature from Cashfree
 */
const verifyPaymentSignature = (orderId, orderAmount, signature, timestamp) => {
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
    }
    catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};
exports.verifyPaymentSignature = verifyPaymentSignature;
/**
 * Get payment details from Cashfree
 */
const getPaymentDetails = async (orderId) => {
    try {
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'TEST';
        if (!appId || !secretKey) {
            throw new Error('Cashfree credentials not configured');
        }
        // Initialize Cashfree
        cashfree_pg_1.Cashfree.XClientId = appId;
        cashfree_pg_1.Cashfree.XClientSecret = secretKey;
        cashfree_pg_1.Cashfree.XEnvironment = env === 'PROD' ? cashfree_pg_1.Cashfree.Environment.PRODUCTION : cashfree_pg_1.Cashfree.Environment.SANDBOX;
        const response = await cashfree_pg_1.Cashfree.PGOrderFetchPayments('2023-08-01', orderId);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching payment details:', error.response?.data || error.message);
        throw new Error('Failed to fetch payment details');
    }
};
exports.getPaymentDetails = getPaymentDetails;
//# sourceMappingURL=cashfree.js.map