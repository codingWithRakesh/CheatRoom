import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IFingerprint extends Document {
    _id: Schema.Types.ObjectId;
    visitorId: string;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}

const fingerprintSchema = new Schema<IFingerprint>({
    visitorId: {
        type: String,
        required: true,
        unique: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1296000 // 15 days
    }
}, { timestamps: true });

fingerprintSchema.plugin(mongooseAggregatePaginate);

export const Fingerprint = model<IFingerprint>("Fingerprint", fingerprintSchema);
