"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Canteen_1 = __importDefault(require("../models/Canteen"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
const Order_1 = __importDefault(require("../models/Order"));
const Payment_1 = __importDefault(require("../models/Payment"));
dotenv_1.default.config();
const clearDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        // Get counts before deletion
        const userCount = await User_1.default.countDocuments();
        const canteenCount = await Canteen_1.default.countDocuments();
        const menuItemCount = await MenuItem_1.default.countDocuments();
        const orderCount = await Order_1.default.countDocuments();
        const paymentCount = await Payment_1.default.countDocuments();
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
        await User_1.default.deleteMany({});
        console.log('✅ Deleted all users');
        await Canteen_1.default.deleteMany({});
        console.log('✅ Deleted all canteens');
        await MenuItem_1.default.deleteMany({});
        console.log('✅ Deleted all menu items');
        await Order_1.default.deleteMany({});
        console.log('✅ Deleted all orders');
        await Payment_1.default.deleteMany({});
        console.log('✅ Deleted all payments');
        console.log('\n✨ Database cleared successfully!');
        // Disconnect
        await mongoose_1.default.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};
clearDatabase();
//# sourceMappingURL=clear-database.js.map