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
const checkDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        console.log('\n📊 Database Statistics:');
        // Users
        const users = await User_1.default.find({});
        console.log(`\n👥 Users (${users.length}):`);
        users.forEach(u => {
            console.log(`   - ${u.email} [${u.role}]`);
        });
        // Counts for other collections
        const canteens = await Canteen_1.default.countDocuments();
        const menuItems = await MenuItem_1.default.countDocuments();
        const orders = await Order_1.default.countDocuments();
        const payments = await Payment_1.default.countDocuments();
        console.log('\n📦 Collections:');
        console.log(`   Canteens: ${canteens}`);
        console.log(`   Menu Items: ${menuItems}`);
        console.log(`   Orders: ${orders}`);
        console.log(`   Payments: ${payments}`);
        await mongoose_1.default.disconnect();
        console.log('\n👋 Disconnected');
    }
    catch (error) {
        console.error('❌ Error checking database:', error);
        process.exit(1);
    }
};
checkDatabase();
//# sourceMappingURL=check-db.js.map