import { Schema,model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const feedbackSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
        required: true,
    },
    attachment : {
        type: String,
    }
},{timestamps : true})

feedbackSchema.plugin(mongooseAggregatePaginate);
export const Feedback = model("Feedback",feedbackSchema)