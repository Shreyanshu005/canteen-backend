import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';
import Payment from '../models/Payment';
import MenuItem from '../models/MenuItem';
import { getPaymentDetails, getRazorpayOrderDetails } from '../utils/razorpay';
import { generateOrderQR } from '../utils/qrGenerator';

dotenv.config();

const syncOrder = async (razorpayOrderId: string) => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI not defined');

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // 1. Find the payment record
        const payment = await Payment.findOne({ razorpayOrderId });
        if (!payment) {
            console.error(`❌ Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
            process.exit(1);
        }

        // 2. Fetch order details from Razorpay
        console.log(`🔍 Fetching details from Razorpay for ${razorpayOrderId}...`);
        const rzpOrder = await getRazorpayOrderDetails(razorpayOrderId);

        console.log(`Status: ${rzpOrder.status}`);

        if (rzpOrder.status === 'paid') {
            // Find underlying order
            const order = await Order.findById(payment.orderId);
            if (!order) {
                console.error('❌ Order not found in database');
                process.exit(1);
            }

            if (order.paymentStatus === 'success') {
                console.log('ℹ️ Order is already marked as paid.');
                process.exit(0);
            }

            console.log('🔄 Updating database...');

            // Update payment
            payment.status = 'success';
            // Note: We might need a payment_id if there are multiple payments for one order, 
            // but usually we can take the first successful one for recovery.
            await payment.save();

            // Update order
            order.paymentStatus = 'success';
            order.status = 'paid';

            // Deduct inventory
            console.log('📦 Deducting inventory...');
            for (const item of order.items) {
                const menuItem = await MenuItem.findById(item.menuItemId);
                if (menuItem) {
                    menuItem.availableQuantity -= item.quantity;
                    await menuItem.save();
                    console.log(`   - Deducted ${item.quantity} of ${item.name}`);
                }
            }

            // Generate QR code
            if (!order.qrCode) {
                console.log('🎫 Generating QR code...');
                const qrCode = await generateOrderQR(order.orderId);
                order.qrCode = qrCode;
            }

            await order.save();
            console.log('✅ Order successfully synchronized and marked as PAID.');
        } else {
            console.log(`⚠️ Razorpay reports status: ${rzpOrder.status}. No action taken.`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

const rzpOrderId = process.argv[2];
if (!rzpOrderId) {
    console.error('Usage: npx ts-node src/scripts/sync-payment.ts <razorpay_order_id>');
    process.exit(1);
}

syncOrder(rzpOrderId);
