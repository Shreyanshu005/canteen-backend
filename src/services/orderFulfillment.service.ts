import Order from '../models/Order';
import Payment from '../models/Payment';
import MenuItem from '../models/MenuItem';
import redis from '../config/redis';
import { generateOrderQR } from '../utils/qrGenerator';

/**
 * Shared logic to fulfill an order after successful payment.
 * This should be used by both manual verification and webhook handlers.
 */
export const fulfillOrder = async (razorpayOrderId: string, razorpayPaymentId: string, paymentMethod: string) => {
    console.log(`🚀 Starting fulfillment for Razorpay Order: ${razorpayOrderId}`);

    // 1. Find and update payment record
    // We try to transition from 'initiated' to 'success'
    let payment = await Payment.findOneAndUpdate(
        {
            razorpayOrderId,
            status: 'initiated'
        },
        {
            status: 'success',
            razorpayPaymentId,
            paymentMethod
        },
        { new: true }
    );

    if (!payment) {
        // If we didn't find an 'initiated' payment, it might already be 'success'
        payment = await Payment.findOne({ razorpayOrderId });

        if (!payment) {
            console.error(`❌ Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
            throw new Error(`Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
        }

        console.log(`ℹ️  Payment ${razorpayOrderId} already marked as ${payment.status}.`);

        // If it was 'success' but had 'N/A' as payment ID (from order.paid event), 
        // and now we have a real payment ID (from payment.captured), update it.
        if (payment.status === 'success' && payment.razorpayPaymentId === 'N/A' && razorpayPaymentId !== 'N/A') {
            console.log(`📝 Updating payment ${razorpayOrderId} with real Payment ID: ${razorpayPaymentId}`);
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.paymentMethod = paymentMethod;
            await payment.save();
        }
    } else {
        console.log(`✅ Payment record ${payment._id} updated to success.`);
    }

    // 2. Find associated order
    const order = await Order.findById(payment.orderId);
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
    } else if (!order.paymentId || order.paymentId === 'N/A') {
        order.paymentId = payment.razorpayPaymentId || 'N/A';
    }

    // 4. Generate QR code if missing or invalid
    if (!order.qrCode) {
        console.log(`Genrating QR code for order ${order.orderId}...`);
        try {
            order.qrCode = await generateOrderQR(order.orderId);
            console.log(`✅ QR code generated.`);
        } catch (qrErr) {
            console.error(`⚠️ Failed to generate QR code for ${order.orderId}:`, qrErr);
            // We still want to save the order as paid even if QR fails
        }
    }

    await order.save();
    console.log(`🎊 Successfully fulfilled order ${order.orderId}`);

    // Invalidate menu cache (inventory might have changed or just to keep it fresh)
    try {
        await redis.del(`menu:${order.canteenId}`);
        console.log(`♻️  Invalidated menu cache for canteen: ${order.canteenId}`);
    } catch (e) {
        console.error('Failed to invalidate menu cache', e);
    }

    return order;
};
