"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const setAdminRole = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        const email = 'maheshwarisarthak110@gmail.com';
        // Find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            console.log('💡 The user needs to sign up first before being made an admin');
            await mongoose_1.default.disconnect();
            return;
        }
        // Update role to admin
        user.role = 'admin';
        await user.save();
        console.log(`✅ Successfully set ${email} as admin`);
        console.log(`📋 User details:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        // Disconnect
        await mongoose_1.default.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error setting admin role:', error);
        process.exit(1);
    }
};
setAdminRole();
//# sourceMappingURL=set-sarthak-admin.js.map