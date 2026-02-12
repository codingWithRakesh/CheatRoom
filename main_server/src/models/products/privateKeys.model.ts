import { Schema, Types, model } from "mongoose";

export interface IPrivateKey extends Document {
    _id: Types.ObjectId;
    roomID: Types.ObjectId;
    privateKey: string;
    createdAt: Date;
    updatedAt: Date;
}

const privateKeySchema = new Schema<IPrivateKey>({
    roomID: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    privateKey: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const PrivateKey = model<IPrivateKey>("PrivateKey", privateKeySchema)