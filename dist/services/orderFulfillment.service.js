"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Payment_1 = __importDefault(require("../models/Payment"));
const redis_1 = __importDefault(require("../config/redis"));
const qrGenerator_1 = require("../utils/qrGenerator");
const razorpay_1 = require("../utils/razorpay");
/**
 * Shared logic to fulfill an order after successful payment.
 * This should be used by both manual verification and webhook handlers.
 */
const fulfillOrder = async (razorpayOrderId, razorpayPaymentId, paymentMethod) => {
    console.log(`🚀 Starting fulfillment for Razorpay Order: ${razorpayOrderId}`);
    // 1. Find and update payment record
    // We try to transition from 'initiated' to 'success'
    let payment = await Payment_1.default.findOneAndUpdate({
        razorpayOrderId,
        status: 'initiated'
    }, {
        status: 'success',
        razorpayPaymentId,
        paymentMethod
    }, { new: true });
    if (!payment) {
        // If we didn't find an 'initiated' payment, it might already be 'success'
        payment = await Payment_1.default.findOne({ razorpayOrderId });
        if (!payment) {
            // Payment record doesn't exist at all - this can happen when webhook arrives
            // before the user calls /payments/initiate (race condition)
            console.log(`⚠️  Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
            console.log(`🔍 Fetching Razorpay order details to find matching order...`);
            try {
                // Fetch the Razorpay order details to get the receipt (which contains our orderId)
                const razorpayOrderDetails = await (0, razorpay_1.getRazorpayOrderDetails)(razorpayOrderId);
                const ourOrderId = razorpayOrderDetails.receipt; // This is our custom orderId
                if (!ourOrderId) {
                    console.error(`❌ No receipt found in Razorpay order ${razorpayOrderId}`);
                    throw new Error(`Cannot match order: No receipt in Razorpay order ${razorpayOrderId}`);
                }
                console.log(`📋 Found receipt in Razorpay order: ${ourOrderId}`);
                // Find our order using the orderId from the receipt
                const matchedOrder = await Order_1.default.findOne({ orderId: ourOrderId });
                if (!matchedOrder) {
                    console.error(`❌ Could not find order with orderId: ${ourOrderId}`);
                    throw new Error(`Order not found for orderId: ${ourOrderId} (from Razorpay receipt)`);
                }
                console.log(`✅ Matched order: ${matchedOrder.orderId} (${matchedOrder._id})`);
                // Create the payment record from webhook data
                console.log(`📝 Creating payment record for order ${matchedOrder.orderId} from webhook data`);
                payment = await Payment_1.default.create({
                    orderId: matchedOrder._id,
                    razorpayOrderId,
                    razorpayPaymentId,
                    amount: matchedOrder.totalAmount,
                    status: 'success',
                    paymentMethod
                });
                console.log(`✅ Payment record created: ${payment._id}`);
            }
            catch (err) {
                console.error(`❌ Failed to create payment record from webhook:`, err);
                throw new Error(`Payment record not found and failed to create from webhook: ${err.message}`);
            }
        }
        else {
            console.log(`ℹ️  Payment ${razorpayOrderId} already marked as ${payment.status}.`);
            // If it was 'success' but had 'N/A' as payment ID (from order.paid event), 
            // and now we have a real payment ID (from payment.captured), update it.
            if (payment.status === 'success' && payment.razorpayPaymentId === 'N/A' && razorpayPaymentId !== 'N/A') {
                console.log(`📝 Updating payment ${razorpayOrderId} with real Payment ID: ${razorpayPaymentId}`);
                payment.razorpayPaymentId = razorpayPaymentId;
                payment.paymentMethod = paymentMethod;
                await payment.save();
            }
        }
    }
    else {
        console.log(`✅ Payment record ${payment._id} updated to success.`);
    }
    // 2. Find associated order
    const order = await Order_1.default.findById(payment.orderId);
    if (!order) {
        console.error(`❌ Order not found in database for payment: ${payment._id}`);
        throw new Error(`Order not found for payment: ${payment._id}`);
    }
    console.log(`🔍 Found Order: ${order.orderId} (Status: ${order.status}, Payment Status: ${order.paymentStatus})`);
    // Safety check: If order is already fulfilled, stop here
    // But if it's 'pending' or 'cancelled' (by cleanup job), we should fulfill it if they paid!
    if (order.paymentStatus === 'success' && order.status !== 'pending' && order.status !== 'cancelled') {
        console.log(`✅ Order ${order.orderId} already fulfilled and in ${order.status} state. Skipping.`);
        return order;
    }
    // 3. Update order record
    console.log(`📝 Updating order ${order.orderId} to 'paid' status...`);
    order.paymentStatus = 'success';
    order.status = 'paid';
    // Use the best available payment ID
    if (razorpayPaymentId && razorpayPaymentId !== 'N/A') {
        order.paymentId = razorpayPaymentId;
    }
    else if (!order.paymentId || order.paymentId === 'N/A') {
        order.paymentId = payment.razorpayPaymentId || 'N/A';
    }
    // 4. Generate QR code if missing or invalid
    if (!order.qrCode) {
        console.log(`Genrating QR code for order ${order.orderId}...`);
        try {
            order.qrCode = await (0, qrGenerator_1.generateOrderQR)(order.orderId);
            console.log(`✅ QR code generated.`);
        }
        catch (qrErr) {
            console.error(`⚠️ Failed to generate QR code for ${order.orderId}:`, qrErr);
            // We still want to save the order as paid even if QR fails
        }
    }
    await order.save();
    console.log(`🎊 Successfully fulfilled order ${order.orderId}`);
    // Invalidate menu cache (inventory might have changed or just to keep it fresh)
    try {
        await redis_1.default.del(`menu:${order.canteenId}`);
        console.log(`♻️  Invalidated menu cache for canteen: ${order.canteenId}`);
    }
    catch (e) {
        console.error('Failed to invalidate menu cache', e);
    }
    return order;
};
exports.fulfillOrder = fulfillOrder;
//# sourceMappingURL=orderFulfillment.service.js.map