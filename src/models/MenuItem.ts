import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
    name: string;
    price: number;
    availableQuantity: number;
    canteenId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const MenuItemSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the item'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    availableQuantity: {
        type: Number,
        required: [true, 'Please add available quantity'],
        min: 0,
    },
    canteenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Canteen',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
