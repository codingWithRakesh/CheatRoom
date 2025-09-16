import cron from "node-cron";
import { Room } from "../models/room.model.js";
import { Message } from "../models/message.model.js";
import { deleteFromCloudinary, getPublicId } from "./cloudinary.js";
import { deleteFromImageKit } from "./imageKit.js";

// Cron job running every minute
cron.schedule("* * * * *", async () => {
  try {
    // Find expired rooms older than 10 days
    const expiredRooms = await Room.find({
      createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      // createdAt: { $lt: new Date(Date.now() - 2 * 60 * 1000) }
    });

    for (const room of expiredRooms) {
      // Find all messages of the expired room
      const messages = await Message.find({ roomID: room._id });

      for (const message of messages) {
        if (message.isFile) {
          if (message.fileId) {
            // Delete from ImageKit using fileId
            await deleteFromImageKit(message.fileId);
          } else {
            // Delete from Cloudinary using publicId extracted from URL
            const publicId = getPublicId(message.content);
            await deleteFromCloudinary(publicId);
          }
        }
      }

      // Remove messages and room itself
      await Message.deleteMany({ roomID: room._id });
      await Room.deleteOne({ _id: room._id });
    }

    // Delete orphan messages not belonging to any existing room
    const rooms = await Room.find().select("_id");
    const roomIds = rooms.map(r => r._id);
    const orphanMessages = await Message.find({ roomID: { $nin: roomIds } });

    for (const message of orphanMessages) {
      if (message.isFile) {
        if (message.fileId) {
          await deleteFromImageKit(message.fileId);
        } else {
          const publicId = getPublicId(message.content);
          await deleteFromCloudinary(publicId);
        }
      }
    }

    await Message.deleteMany({ roomID: { $nin: roomIds } });

    if (expiredRooms.length > 0) {
      console.log(`🗑 Deleted ${expiredRooms.length} expired rooms and their messages/files`);
    } else {
      console.log("✅ No expired rooms to delete");
    }

  } catch (err) {
    console.error("Cron job error:", err);
  }
});
