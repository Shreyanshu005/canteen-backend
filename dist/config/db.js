"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/canteen-app';
        console.log('⏳ Connecting to MongoDB...');
        const conn = await mongoose_1.default.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('👉 Tip: Check if your IP is whitelisted in MongoDB Atlas!');
        // Keep the server alive so it can log webhooks or other requests
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map