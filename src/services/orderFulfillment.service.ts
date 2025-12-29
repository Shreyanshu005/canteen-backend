import Order from '../models/Order';
import Payment from '../models/Payment';
import MenuItem from '../models/MenuItem';
import { generateOrderQR } from '../utils/qrGenerator';

/**
 * Shared logic to fulfill an order after successful payment.
 * This should be used by both manual verification and webhook handlers.
 */
export const fulfillOrder = async (razorpayOrderId: string, razorpayPaymentId: string, paymentMethod: string) => {
    // 1. Find and update payment record ATOMICALLY to 'success'
    // This act as a "distributed lock" - only the first request to hit this will see status 'initiated'
    const payment = await Payment.findOneAndUpdate(
        {
            razorpayOrderId,
            status: 'initiated' // Only allow transition from initiated
        },
        {
            status: 'success',
            razorpayPaymentId,
            paymentMethod
        },
        { new: true }
    );

    if (!payment) {
        // If we didn't find a payment with 'initiated' status, it might already be 'success'
        const existingPayment = await Payment.findOne({ razorpayOrderId });
        if (existingPayment?.status === 'success') {
            console.log(`ℹ️  Payment ${razorpayOrderId} already processed. Skipping to avoid double-fulfillment.`);
            return null; // Return null or existing order to indicate "already done"
        }
        throw new Error(`Payment record not found or in invalid state for Razorpay Order ID: ${razorpayOrderId}`);
    }

    // 2. Find associated order
    const order = await Order.findById(payment.orderId);
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

    // 5. Deduct inventory quantities
    console.log(`Deducting inventory for order ${order.orderId}...`);
    for (const item of order.items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (menuItem) {
            menuItem.availableQuantity -= item.quantity;
            await menuItem.save();
        }
    }

    // 6. Generate QR code if missing
    if (!order.qrCode) {
        order.qrCode = await generateOrderQR(order.orderId);
    }

    await order.save();
    console.log(`Successfully fulfilled order ${order.orderId}`);

    return order;
};
