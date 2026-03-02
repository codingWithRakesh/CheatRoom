import {model, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IAnalyzeJoin extends Document {
    roomId: Schema.Types.ObjectId;
    visitorId: Schema.Types.ObjectId;
    countJoins: number;
    messagesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const analyzeJoinSchema = new Schema<IAnalyzeJoin>({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    visitorId: {
        type: Schema.Types.ObjectId,
        ref: "Fingerprint",
        required: true
    },
    countJoins: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

analyzeJoinSchema.plugin(mongooseAggregatePaginate);

export const AnalyzeJoin = model<IAnalyzeJoin>("AnalyzeJoin", analyzeJoinSchema);