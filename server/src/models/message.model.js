import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const messageSchema = new Schema({
    roomID: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    parentMessageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
}, { timestamps: true });


messageSchema.plugin(mongooseAggregatePaginate);

export const Message = model("Message", messageSchema);