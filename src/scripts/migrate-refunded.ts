import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';
import connectDB from '../config/db';

dotenv.config();

const migrateRefundedOrders = async () => {
    try {
        await connectDB();
        console.log('⏳ Searching for orders with paymentStatus: "refunded"...');

        const ordersToFix = await Order.find({ paymentStatus: 'refunded' });

        if (ordersToFix.length === 0) {
            console.log('✅ No orders with "refunded" status found.');
        } else {
            console.log(`⚠️  Found ${ordersToFix.length} orders to update.`);

            const result = await Order.updateMany(
                { paymentStatus: 'refunded' },
                { $set: { paymentStatus: 'failed' } }
            );

            console.log(`✅ Successfully updated ${result.modifiedCount} orders to "failed".`);
        }

        await mongoose.connection.close();
        console.log('👋 Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateRefundedOrders();
