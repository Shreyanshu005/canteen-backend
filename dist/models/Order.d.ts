import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IOrder>;
export default _default;
//# sourceMappingURL=Order.d.ts.map