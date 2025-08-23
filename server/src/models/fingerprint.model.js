import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const fingerprintSchema = new Schema({
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

export const Fingerprint = model("Fingerprint", fingerprintSchema);
