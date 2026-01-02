import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    status: 'initiated' | 'success' | 'failed';
    paymentMethod?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        razorpayOrderId: {
            type: String,
            required: true,
        },
        razorpayPaymentId: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['initiated', 'success', 'failed'],
            default: 'initiated',
        },
        paymentMethod: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indices for faster lookup
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
