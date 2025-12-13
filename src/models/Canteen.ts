import mongoose, { Schema, Document } from 'mongoose';

export interface ICanteen extends Document {
    name: string;
    place: string;
    ownerId: mongoose.Types.ObjectId;
    isOpen: boolean;
    openingTime?: string;
    closingTime?: string;
    createdAt: Date;
}

const CanteenSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a canteen name'],
        trim: true,
    },
    place: {
        type: String,
        required: [true, 'Please add a place'],
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    openingTime: {
        type: String, // Format: "HH:MM" (Be cautious with validation if strictness needed)
    },
    closingTime: {
        type: String, // Format: "HH:MM"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<ICanteen>('Canteen', CanteenSchema);
