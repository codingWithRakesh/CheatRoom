import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const roomSchema = new Schema({
  codeHash: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    type: String
  }],
  isAdminRoom: {
    type: Schema.Types.ObjectId,
    ref: "Fingerprint"
  },
  publicKey: {
    type: String,
    required: true
  }
}, { timestamps: true });

roomSchema.plugin(mongooseAggregatePaginate);

export const Room = model("Room", roomSchema);
