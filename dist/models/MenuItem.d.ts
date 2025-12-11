import mongoose, { Document } from 'mongoose';
export interface IMenuItem extends Document {
    name: string;
    price: number;
    availableQuantity: number;
    canteenId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IMenuItem, {}, {}, {}, mongoose.Document<unknown, {}, IMenuItem, {}, mongoose.DefaultSchemaOptions> & IMenuItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IMenuItem>;
export default _default;
//# sourceMappingURL=MenuItem.d.ts.map