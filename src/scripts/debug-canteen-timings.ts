import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from '../models/Canteen';

dotenv.config();

const getDetailedCanteenTimings = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const canteens = await Canteen.find({}, 'name openingTime closingTime place isOpen');

        console.log('\n🕒 Detailed Canteen Timings:');
        console.log(`   Current Server Time: ${new Date().toLocaleTimeString()} (${new Date().toISOString()})`);

        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        console.log(`   Current Server Time: ${now.toLocaleTimeString()} (${now.toISOString()})`);
        console.log(`   Target IST Time: ${istTime.toLocaleTimeString()} (Asia/Kolkata)`);

        const currentHours = istTime.getHours();
        const currentMinutes = istTime.getMinutes();
        const currentTimeValue = currentHours * 60 + currentMinutes;
        console.log(`   Current Time Value (IST minutes since midnight): ${currentTimeValue}`);

        if (canteens.length === 0) {
            console.log('   No canteens found.');
        } else {
            canteens.forEach(c => {
                const status = c.isOpen ? '🟢 Open' : '🔴 Closed';
                const opening = c.openingTime ? c.openingTime : 'Not set';
                const closing = c.closingTime ? c.closingTime : 'Not set';

                console.log(`\n   🏠 ${c.name} (${c.place})`);
                console.log(`      Status: ${status}`);
                console.log(`      Opening Time: ${opening}`);
                console.log(`      Closing Time: ${closing}`);

                if (c.openingTime && c.closingTime) {
                    const timePartsOpen = c.openingTime.split(':').map(Number);
                    const openH = timePartsOpen[0] || 0;
                    const openM = timePartsOpen[1] || 0;
                    const openTimeValue = openH * 60 + openM;

                    const timePartsClose = c.closingTime.split(':').map(Number);
                    const closeH = timePartsClose[0] || 0;
                    const closeM = timePartsClose[1] || 0;
                    const closeTimeValue = closeH * 60 + closeM;

                    console.log(`      Open Value: ${openTimeValue}, Close Value: ${closeTimeValue}`);

                    if (currentTimeValue < openTimeValue || currentTimeValue > closeTimeValue) {
                        console.log(`      ❌ CLOSED by logic: ${currentTimeValue} is outside [${openTimeValue}, ${closeTimeValue}]`);
                    } else {
                        console.log(`      ✅ OPEN by logic`);
                    }
                }
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

getDetailedCanteenTimings();
