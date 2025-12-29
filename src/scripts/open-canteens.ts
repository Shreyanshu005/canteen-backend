import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from '../models/Canteen';

dotenv.config();

const openAllCanteens = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const result = await Canteen.updateMany({ isOpen: false }, { $set: { isOpen: true } });

        console.log(`✅ Successfully updated ${result.modifiedCount} canteens to be OPEN.`);

        const canteens = await Canteen.find({}, 'name isOpen openingTime closingTime');
        console.log('\n📊 Current Canteen Status:');
        canteens.forEach(c => {
            console.log(`   - ${c.name}: ${c.isOpen ? '🟢 OPEN' : '🔴 CLOSED'} (${c.openingTime} - ${c.closingTime})`);
        });

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error updating canteens:', error);
        process.exit(1);
    }
};

openAllCanteens();
