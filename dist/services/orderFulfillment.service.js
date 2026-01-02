"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Payment_1 = __importDefault(require("../models/Payment"));
const qrGenerator_1 = require("../utils/qrGenerator");
/**
 * Shared logic to fulfill an order after successful payment.
 * This should be used by both manual verification and webhook handlers.
 */
const fulfillOrder = async (razorpayOrderId, razorpayPaymentId, paymentMethod) => {
    // 1. Find and update payment record ATOMICALLY to 'success'
    // This act as a "distributed lock" - only the first request to hit this will see status 'initiated'
    const payment = await Payment_1.default.findOneAndUpdate({
        razorpayOrderId,
        status: 'initiated' // Only allow transition from initiated
    }, {
        status: 'success',
        razorpayPaymentId,
        paymentMethod
    }, { new: true });
    if (!payment) {
        // If we didn't find a payment with 'initiated' status, it might already be 'success'
        const existingPayment = await Payment_1.default.findOne({ razorpayOrderId });
        if (existingPayment?.status === 'success') {
            console.log(`ℹ️  Payment ${razorpayOrderId} already processed. Skipping to avoid double-fulfillment.`);
            return null; // Return null or existing order to indicate "already done"
        }
        throw new Error(`Payment record not found or in invalid state for Razorpay Order ID: ${razorpayOrderId}`);
    }
    // 2. Find associated order
    const order = await Order_1.default.findById(payment.orderId);
    if (!order) {
        console.error(`❌ Order not found in database for payment: ${payment._id}`);
        throw new Error(`Order not found for payment: ${payment._id}`);
    }
    console.log(`🔍 Found Order: ${order.orderId} (Current Status: ${order.status}, Payment: ${order.paymentStatus})`);
    // Safety check: If order is already paid, stop here
    if (order.paymentStatus === 'success') {
        console.log(`✅ Order ${order.orderId} already marked as paid. Skipping fulfillment.`);
        return order;
    }
    // 3. Update order record
    order.paymentStatus = 'success';
    order.status = 'paid';
    order.paymentId = razorpayPaymentId;
    // 5. Deduct inventory quantities - REMOVED
    // Inventory is now deducted atomically at the time of order creation (createOrder).
    // This allows us to reserve stock immediately and avoid race conditions.
    console.log(`Inventory already deducted for order ${order.orderId} at creation.`);
    // 6. Generate QR code if missing
    if (!order.qrCode) {
        order.qrCode = await (0, qrGenerator_1.generateOrderQR)(order.orderId);
    }
    await order.save();
    console.log(`Successfully fulfilled order ${order.orderId}`);
    return order;
};
exports.fulfillOrder = fulfillOrder;
//# sourceMappingURL=orderFulfillment.service.js.map