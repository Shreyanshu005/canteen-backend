"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Order_1 = __importDefault(require("../models/Order"));
const Payment_1 = __importDefault(require("../models/Payment"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
const razorpay_1 = require("../utils/razorpay");
const qrGenerator_1 = require("../utils/qrGenerator");
dotenv_1.default.config();
const syncOrder = async (razorpayOrderId) => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri)
            throw new Error('MONGO_URI not defined');
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        // 1. Find the payment record
        const payment = await Payment_1.default.findOne({ razorpayOrderId });
        if (!payment) {
            console.error(`❌ Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
            process.exit(1);
        }
        // 2. Fetch order details from Razorpay
        console.log(`🔍 Fetching details from Razorpay for ${razorpayOrderId}...`);
        const rzpOrder = await (0, razorpay_1.getRazorpayOrderDetails)(razorpayOrderId);
        console.log(`Status: ${rzpOrder.status}`);
        if (rzpOrder.status === 'paid') {
            // Find underlying order
            const order = await Order_1.default.findById(payment.orderId);
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
                const menuItem = await MenuItem_1.default.findById(item.menuItemId);
                if (menuItem) {
                    menuItem.availableQuantity -= item.quantity;
                    await menuItem.save();
                    console.log(`   - Deducted ${item.quantity} of ${item.name}`);
                }
            }
            // Generate QR code
            if (!order.qrCode) {
                console.log('🎫 Generating QR code...');
                const qrCode = await (0, qrGenerator_1.generateOrderQR)(order.orderId);
                order.qrCode = qrCode;
            }
            await order.save();
            console.log('✅ Order successfully synchronized and marked as PAID.');
        }
        else {
            console.log(`⚠️ Razorpay reports status: ${rzpOrder.status}. No action taken.`);
        }
        await mongoose_1.default.disconnect();
    }
    catch (error) {
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
//# sourceMappingURL=sync-payment.js.map