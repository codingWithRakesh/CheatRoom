import { model, Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IRoom extends Document {
  _id: Schema.Types.ObjectId;
  codeHash: string;
  participants: string[];
  isAdminRoom: Schema.Types.ObjectId;
  publicKey: string;
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<IRoom>;
}

const roomSchema = new Schema<IRoom>({
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

export const Room = model<IRoom>("Room", roomSchema);
