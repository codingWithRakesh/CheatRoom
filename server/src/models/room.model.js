import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const roomSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{6}$/
    },
    // createdAt: {
    //     type: Date,
    //     default: Date.now,
    //     expires: 604800 // 7 days
    // },
    participants : [{
        type : String
    }]
}, { timestamps: true });

roomSchema.plugin(mongooseAggregatePaginate);

export const Room = model("Room", roomSchema);
