import { Schema, model } from "mongoose";

const privateKeySchema = new Schema({
    roomID : {
        type : Schema.Types.ObjectId,
        ref : "Room",
        required : true
    },
    privateKey : {
        type : String,
        required : true
    }
},{timestamps : true})

export const PrivateKey = model("PrivateKey", privateKeySchema)