"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config();
const updateRole = async () => {
    try {
        await (0, db_1.default)();
        const email = 'rishabh.snghl0123@gmail.com';
        let user = await User_1.default.findOne({ email });
        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`SUCCESS: User ${email} has been updated to role 'admin'.`);
        }
        else {
            console.log(`User ${email} not found. Creating new admin user...`);
            user = await User_1.default.create({
                email,
                role: 'admin',
            });
            console.log(`SUCCESS: User ${email} created with role 'admin'.`);
        }
    }
    catch (error) {
        console.error('Error setting admin role:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit();
    }
};
updateRole();
//# sourceMappingURL=set-anjali-admin.js.map