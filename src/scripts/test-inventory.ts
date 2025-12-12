import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import Canteen from '../models/Canteen';
import User from '../models/User';

dotenv.config();

const testInventoryDeduction = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find a menu item
        const menuItem = await MenuItem.findOne();
        if (!menuItem) throw new Error('No menu item found');

        const initialQuantity = menuItem.availableQuantity;
        console.log(`📦 Initial Quantity: ${initialQuantity}`);

        // Simulate order with 2 items
        const quantityOrdered = 2;
        menuItem.availableQuantity -= quantityOrdered;
        await menuItem.save();

        console.log(`✅ Deducted ${quantityOrdered} items`);
        console.log(`📦 New Quantity: ${menuItem.availableQuantity}`);

        // Verify
        const updatedItem = await MenuItem.findById(menuItem._id);
        if (updatedItem && updatedItem.availableQuantity === initialQuantity - quantityOrdered) {
            console.log('✅ Inventory deduction working correctly!');
        } else {
            console.error('❌ Inventory deduction failed');
        }

        // Restore original quantity
        menuItem.availableQuantity = initialQuantity;
        await menuItem.save();
        console.log('🔄 Restored original quantity');

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

testInventoryDeduction();
