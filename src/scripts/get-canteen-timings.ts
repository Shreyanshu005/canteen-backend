import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from '../models/Canteen';

dotenv.config();

const getCanteenTimings = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const canteens = await Canteen.find({}, 'name closingTime place isOpen');

        console.log('\n🕒 Canteen Timings:');
        if (canteens.length === 0) {
            console.log('   No canteens found.');
        } else {
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
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error fetching canteen timings:', error);
        process.exit(1);
    }
};

getCanteenTimings();
