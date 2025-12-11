import mongoose, { Document } from 'mongoose';
export interface ICanteen extends Document {
    name: string;
    place: string;
    ownerId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<ICanteen, {}, {}, {}, mongoose.Document<unknown, {}, ICanteen, {}, mongoose.DefaultSchemaOptions> & ICanteen & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, ICanteen>;
export default _default;
//# sourceMappingURL=Canteen.d.ts.map