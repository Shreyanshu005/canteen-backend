import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Canteen from '../models/Canteen';
import MenuItem from '../models/MenuItem';
import Order from '../models/Order';
import Payment from '../models/Payment';

dotenv.config();

const checkDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        console.log('\n📊 Database Statistics:');

        // Users
        const users = await User.find({});
        console.log(`\n👥 Users (${users.length}):`);
        users.forEach(u => {
            console.log(`   - ${u.email} [${u.role}]`);
        });

        // Counts for other collections
        const canteens = await Canteen.countDocuments();
        const menuItems = await MenuItem.countDocuments();
        const orders = await Order.countDocuments();
        const payments = await Payment.countDocuments();

        console.log('\n📦 Collections:');
        console.log(`   Canteens: ${canteens}`);
        console.log(`   Menu Items: ${menuItems}`);
        console.log(`   Orders: ${orders}`);
        console.log(`   Payments: ${payments}`);

        await mongoose.disconnect();
        console.log('\n👋 Disconnected');

    } catch (error) {
        console.error('❌ Error checking database:', error);
        process.exit(1);
    }
};

checkDatabase();
