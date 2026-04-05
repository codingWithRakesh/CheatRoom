import cron from "node-cron";
import { IRoom, Room } from "../models/products/room.model.js";
import { IMessage, Message } from "../models/products/message.model.js";
import { PrivateKey } from "../models/products/privateKeys.model.js";
import { deleteFromCloudinary, getPublicId } from "./cloudinary.js";
import { deleteFromImageKit } from "./imageKit.js";
import mongoose from "mongoose";
import { AnalyzeJoin } from "../models/analyze/analyzeJoin.model.js";
import { algorithm } from "../constants.js";
import { CryptoUtils } from "../utils/cryptoUtils.js";

cron.schedule("* * * * *", async (): Promise<void> => {
  try {
    const expiredRooms: IRoom[] = await Room.find({
      createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } // 10 days
    });

    const key: Buffer = CryptoUtils.genrateKey();

    for (const room of expiredRooms) {
      const messages: IMessage[] = await Message.find({ roomID: room._id });

      for (const message of messages) {
        if (message.isFile) {
          if (message.fileId) {
            await deleteFromImageKit(message.fileId);
          } else {
            if (message.content && message.iv) {
              const key: Buffer = CryptoUtils.genrateKey();
              const decrypted: string = CryptoUtils.decrypt(algorithm, key, message.content, message.iv);
              const publicId: string | null = getPublicId(decrypted);
              if (publicId) {
                await deleteFromCloudinary(publicId);
              }
            }
          }
        }
      }

      await Message.deleteMany({ roomID: room._id });
      await PrivateKey.deleteOne({ roomID: room._id });
      await Room.deleteOne({ _id: room._id });
      await AnalyzeJoin.deleteMany({ roomId: room._id });
    }

    const rooms: IRoom[] = await Room.find().select("_id");
    const roomIds: mongoose.Schema.Types.ObjectId[] = rooms.map(r => r._id);
    const orphanMessages: IMessage[] = await Message.find({ roomID: { $nin: roomIds } });

    for (const message of orphanMessages) {
      if (message.isFile) {
        if (message.fileId) {
          await deleteFromImageKit(message.fileId);
        } else {
          if (message.content && message.iv) {
            const key: Buffer = CryptoUtils.genrateKey();
            const decrypted: string = CryptoUtils.decrypt(algorithm, key, message.content, message.iv);
            const publicId: string | null = getPublicId(decrypted);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }
        }
      }
    }

    await Message.deleteMany({ roomID: { $nin: roomIds } });

    if (expiredRooms.length > 0) {
      console.log(`🗑 Deleted ${expiredRooms.length} expired rooms and their messages/files`);
    } else {
      console.log("✅ No expired rooms to delete");
    }

  } catch (err: unknown) {
    console.error("Cron job error:", err);
  }
});
