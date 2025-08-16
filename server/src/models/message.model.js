import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const messageSchema = new Schema({
    roomID: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    fingerprintID: {
        type: Schema.Types.ObjectId,
        ref: "Fingerprint",
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isReply: {
        type: Boolean,
        default: false
    },
    parentMessageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
}, { timestamps: true });


messageSchema.plugin(mongooseAggregatePaginate);

export const Message = model("Message", messageSchema);