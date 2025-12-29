import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Canteen from '../models/Canteen';
import MenuItem from '../models/MenuItem';
import Order from '../models/Order';
import Payment from '../models/Payment';

dotenv.config();

const clearDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get counts before deletion
        const userCount = await User.countDocuments();
        const canteenCount = await Canteen.countDocuments();
        const menuItemCount = await MenuItem.countDocuments();
        const orderCount = await Order.countDocuments();
        const paymentCount = await Payment.countDocuments();

        console.log('\n📊 Current Database Status:');
        console.log(`   Users: ${userCount}`);
        console.log(`   Canteens: ${canteenCount}`);
        console.log(`   Menu Items: ${menuItemCount}`);
        console.log(`   Orders: ${orderCount}`);
        console.log(`   Payments: ${paymentCount}`);

        // Confirm deletion
        console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
        console.log('   Press Ctrl+C to cancel or wait 5 seconds to proceed...\n');

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Delete all data
        console.log('🗑️  Deleting all data...\n');

        await User.deleteMany({});
        console.log('✅ Deleted all users');

        await Canteen.deleteMany({});
        console.log('✅ Deleted all canteens');

        await MenuItem.deleteMany({});
        console.log('✅ Deleted all menu items');

        await Order.deleteMany({});
        console.log('✅ Deleted all orders');

        await Payment.deleteMany({});
        console.log('✅ Deleted all payments');

        console.log('\n✨ Database cleared successfully!');

        // Disconnect
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabase();
