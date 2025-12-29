"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
dotenv_1.default.config();
const getMenuItems = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri)
            throw new Error('MONGO_URI missing');
        await mongoose_1.default.connect(mongoUri);
        const items = await MenuItem_1.default.find({}).limit(5);
        console.log('\n🍔 Menu Items:');
        items.forEach(item => {
            console.log(`   - ID: ${item._id}`);
            console.log(`     Name: ${item.name}`);
            console.log(`     Canteen ID: ${item.canteenId}`);
            console.log(`     Price: ${item.price}`);
        });
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
getMenuItems();
//# sourceMappingURL=get-menu-items.js.map