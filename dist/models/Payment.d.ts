import mongoose, { Document } from 'mongoose';
export interface IPayment extends Document {
    orderId: mongoose.Types.ObjectId;
    razorpayPaymentLinkId: string;
    razorpayPaymentId?: string;
    amount: number;
    status: 'initiated' | 'success' | 'failed';
    paymentMethod?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, mongoose.DefaultSchemaOptions> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IPayment>;
export default _default;
//# sourceMappingURL=Payment.d.ts.map