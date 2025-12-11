import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    role: 'admin' | 'user' | 'canteen_owner';
    otp?: string;
    otpExpires?: Date;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'canteen_owner'],
        default: 'user',
    },
    otp: {
        type: String,
        select: false, // Don't return OTP in queries by default
    },
    otpExpires: {
        type: Date,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IUser>('User', UserSchema);
