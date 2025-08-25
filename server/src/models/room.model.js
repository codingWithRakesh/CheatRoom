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
  participants: [{
    type: String
  }],
}, { timestamps: true });

roomSchema.plugin(mongooseAggregatePaginate);

export const Room = model("Room", roomSchema);
