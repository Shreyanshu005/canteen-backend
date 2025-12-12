"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dropIndex = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not defined');
        }
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        const collection = mongoose_1.default.connection.collection('payments');
        // List indexes before
        const indexesBefore = await collection.indexes();
        console.log('Indexes before:', indexesBefore);
        // Drop the problematic index
        // The error said: index: cashfreeOrderId_1
        const indexName = 'cashfreeOrderId_1';
        // Check if exists
        const indexExists = indexesBefore.some((idx) => idx.name === indexName);
        if (indexExists) {
            await collection.dropIndex(indexName);
            console.log(`Index ${indexName} dropped successfully`);
        }
        else {
            console.log(`Index ${indexName} not found, checking for other potential issues...`);
            // Try dropping by key if name is different
            // await collection.dropIndex({ cashfreeOrderId: 1 });
        }
        // List indexes after
        const indexesAfter = await collection.indexes();
        console.log('Indexes after:', indexesAfter);
        console.log('Done');
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
dropIndex();
//# sourceMappingURL=fix-payment-index.js.map