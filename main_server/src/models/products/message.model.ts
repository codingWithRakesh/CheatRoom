import { model, Schema, Types } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  roomID: Types.ObjectId;
  senderId: string;
  content: string;
  isFile: boolean;
  fileName?: string;
  fileType?: string;
  fileId?: string;
  timestamp: Date;
  isAI: boolean;
  parentMessageId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toObject: () => IMessage;
}

const messageSchema = new Schema<IMessage>({
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
    required: true
  },
  isFile: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
  },
  fileType: {
    type: String,
  },
  fileId: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isAI: {
    type: Boolean,
    default: false
  },
  parentMessageId: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
}, { timestamps: true });

messageSchema.plugin(mongooseAggregatePaginate);

export const Message = model<IMessage>("Message", messageSchema);