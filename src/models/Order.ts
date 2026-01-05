import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
}

export interface IOrder extends Document {
    orderId: string;
    userId: mongoose.Types.ObjectId;
    canteenId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'success' | 'failed';
    paymentId?: string;
    qrCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const OrderSchema: Schema = new Schema(
    {
        orderId: {
            type: String,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        canteenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Canteen',
            required: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items: IOrderItem[]) => items.length > 0,
                message: 'Order must have at least one item',
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending',
        },
        paymentId: {
            type: String,
        },
        qrCode: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique order ID before saving
OrderSchema.pre('save', function () {
    if (!this.orderId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        this.orderId = `ORD-${timestamp}-${random}`.toUpperCase();
    }
});

// Compound indexes for optimized querying
OrderSchema.index({ canteenId: 1, status: 1, createdAt: -1 }); // Canteen Dashboard
OrderSchema.index({ userId: 1, createdAt: -1 });               // User History
OrderSchema.index({ status: 1, createdAt: 1 });                // Background Cleanup Jobs
// Note: orderId index is already created via unique: true in schema definition

export default mongoose.model<IOrder>('Order', OrderSchema);
