import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new Schema({
    provider: {
        type: String,
        required: true
    }, // 'google', 'github' etc.
    providerId: {
        type: String,
        required: true
    }, // id from provider
    email: {
        type: String
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
}, { timestamps: true });

userSchema.plugin(mongooseAggregatePaginate);

export const User = model("User", userSchema);