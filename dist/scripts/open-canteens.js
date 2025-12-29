"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Canteen_1 = __importDefault(require("../models/Canteen"));
dotenv_1.default.config();
const openAllCanteens = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        const result = await Canteen_1.default.updateMany({ isOpen: false }, { $set: { isOpen: true } });
        console.log(`✅ Successfully updated ${result.modifiedCount} canteens to be OPEN.`);
        const canteens = await Canteen_1.default.find({}, 'name isOpen openingTime closingTime');
        console.log('\n📊 Current Canteen Status:');
        canteens.forEach(c => {
            console.log(`   - ${c.name}: ${c.isOpen ? '🟢 OPEN' : '🔴 CLOSED'} (${c.openingTime} - ${c.closingTime})`);
        });
        await mongoose_1.default.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error updating canteens:', error);
        process.exit(1);
    }
};
openAllCanteens();
//# sourceMappingURL=open-canteens.js.map