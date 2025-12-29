import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/MenuItem';

dotenv.config();

const getMenuItems = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('MONGO_URI missing');

        await mongoose.connect(mongoUri);

        const items = await MenuItem.find({}).limit(5);

        console.log('\n🍔 Menu Items:');
        items.forEach(item => {
            console.log(`   - ID: ${item._id}`);
            console.log(`     Name: ${item.name}`);
            console.log(`     Canteen ID: ${item.canteenId}`);
            console.log(`     Price: ${item.price}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

getMenuItems();
