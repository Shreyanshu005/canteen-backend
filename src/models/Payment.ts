import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    cashfreeOrderId: string;
    paymentSessionId?: string;
    amount: number;
    status: 'initiated' | 'success' | 'failed';
    paymentMethod?: string;
    transactionId?: string;
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
        cashfreeOrderId: {
            type: String,
            required: true,
            unique: true,
        },
        paymentSessionId: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['initiated', 'success', 'failed'],
            default: 'initiated',
        },
        paymentMethod: {
            type: String,
        },
        transactionId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
