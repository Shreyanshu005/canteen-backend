import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const setAdminRole = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const email = 'maheshwarisarthak110@gmail.com';

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            console.log('💡 The user needs to sign up first before being made an admin');
            await mongoose.disconnect();
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
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error setting admin role:', error);
        process.exit(1);
    }
};

setAdminRole();
