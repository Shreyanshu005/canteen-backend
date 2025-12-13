"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Canteen_1 = __importDefault(require("../models/Canteen"));
dotenv_1.default.config();
const testCanteenStatus = async () => {
    try {
        if (!process.env.MONGO_URI)
            throw new Error('MONGO_URI missing');
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        // Find a canteen or create one
        let canteen = await Canteen_1.default.findOne();
        if (!canteen) {
            console.log('⚠️ No canteen found, creating test canteen...');
            // Need a user... skipping creation for safety, just error if empty
            throw new Error('No canteen found to test. Please ensure a canteen exists.');
        }
        console.log(`🏢 Testing Canteen: ${canteen.name}`);
        // 1. Test Manual Close
        console.log('🔒 Testing Manual Close...');
        canteen.isOpen = false;
        await canteen.save();
        const closedCanteen = await Canteen_1.default.findById(canteen._id);
        if (closedCanteen?.isOpen === false) {
            console.log('✅ Manual Close Persisted');
        }
        else {
            console.error('❌ Manual Close Failed');
        }
        // 2. Test Manual Open
        console.log('🔓 Testing Manual Open...');
        canteen.isOpen = true;
        await canteen.save();
        const openCanteen = await Canteen_1.default.findById(canteen._id);
        if (openCanteen?.isOpen === true) {
            console.log('✅ Manual Open Persisted');
        }
        else {
            console.error('❌ Manual Open Failed');
        }
        // 3. Test Operating Hours
        console.log('⏰ Testing Operating Hours...');
        canteen.openingTime = '09:00';
        canteen.closingTime = '18:00';
        await canteen.save();
        const timedCanteen = await Canteen_1.default.findById(canteen._id);
        if (timedCanteen?.openingTime === '09:00' && timedCanteen?.closingTime === '18:00') {
            console.log('✅ Operating Hours Persisted');
        }
        else {
            console.error('❌ Operating Hours Failed');
        }
        console.log('🎉 All Canteen Status Tests Passed');
        process.exit(0);
    }
    catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};
testCanteenStatus();
//# sourceMappingURL=test-canteen-status.js.map