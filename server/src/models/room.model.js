import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Message } from './message.model.js';

const roomSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{6}$/
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 864000 // 10 days
    },
    participants : [{
        type : String
    }]
}, { timestamps: true });

roomSchema.plugin(mongooseAggregatePaginate);

roomSchema.pre("remove", async function (next) {
    try {
        await Message.deleteMany({ roomID: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

roomSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Message.deleteMany({ roomID: doc._id });
    }
});

export const Room = model("Room", roomSchema);
