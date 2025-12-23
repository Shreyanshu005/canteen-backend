import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import connectDB from '../config/db';

dotenv.config();

const updateRole = async () => {
    try {
        await connectDB();
        const email = 'anjaligupta25092005@gmail.com';
        let user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`SUCCESS: User ${email} has been updated to role 'admin'.`);
        } else {
            console.log(`User ${email} not found. Creating new admin user...`);
            user = await User.create({
                email,
                role: 'admin',
            });
            console.log(`SUCCESS: User ${email} created with role 'admin'.`);
        }
    } catch (error) {
        console.error('Error setting admin role:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

updateRole();
