"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Canteen_1 = __importDefault(require("../models/Canteen"));
dotenv_1.default.config();
const getCanteenTimings = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        const canteens = await Canteen_1.default.find({}, 'name closingTime place isOpen');
        console.log('\n🕒 Canteen Timings:');
        if (canteens.length === 0) {
            console.log('   No canteens found.');
        }
        else {
            canteens.forEach(c => {
                const status = c.isOpen ? '🟢 Open' : '🔴 Closed';
                const closing = c.closingTime ? c.closingTime : 'Not set';
                console.log(`\n   🏠 ${c.name} (${c.place})`);
                console.log(`      Status: ${status}`);
                console.log(`      Closing Time: ${closing}`);
            });
        }
        console.log(''); // Empty line for spacing
        // Disconnect
        await mongoose_1.default.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error fetching canteen timings:', error);
        process.exit(1);
    }
};
getCanteenTimings();
//# sourceMappingURL=get-canteen-timings.js.map