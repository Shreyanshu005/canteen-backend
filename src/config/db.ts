import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/canteen-app';
        console.log('⏳ Connecting to MongoDB...');

        const conn = await mongoose.connect(mongoUri);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('👉 Tip: Check if your IP is whitelisted in MongoDB Atlas!');
        // Keep the server alive so it can log webhooks or other requests
    }
};

export default connectDB;
