"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
dotenv_1.default.config();
const testInventoryDeduction = async () => {
    try {
        if (!process.env.MONGO_URI)
            throw new Error('MONGO_URI missing');
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        // Find a menu item
        const menuItem = await MenuItem_1.default.findOne();
        if (!menuItem)
            throw new Error('No menu item found');
        const initialQuantity = menuItem.availableQuantity;
        console.log(`📦 Initial Quantity: ${initialQuantity}`);
        // Simulate order with 2 items
        const quantityOrdered = 2;
        menuItem.availableQuantity -= quantityOrdered;
        await menuItem.save();
        console.log(`✅ Deducted ${quantityOrdered} items`);
        console.log(`📦 New Quantity: ${menuItem.availableQuantity}`);
        // Verify
        const updatedItem = await MenuItem_1.default.findById(menuItem._id);
        if (updatedItem && updatedItem.availableQuantity === initialQuantity - quantityOrdered) {
            console.log('✅ Inventory deduction working correctly!');
        }
        else {
            console.error('❌ Inventory deduction failed');
        }
        // Restore original quantity
        menuItem.availableQuantity = initialQuantity;
        await menuItem.save();
        console.log('🔄 Restored original quantity');
        process.exit(0);
    }
    catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};
testInventoryDeduction();
//# sourceMappingURL=test-inventory.js.map