import cron from "node-cron";
import { Room } from '../models/room.model.js';
import { Message } from '../models/message.model.js';

cron.schedule("0 0 * * *", async () => {
  try {
    // Delete rooms older than 7 days
    const expiredRooms = await Room.find({
      createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    for (const room of expiredRooms) {
      await Message.deleteMany({ roomID: room._id });
      await Room.deleteOne({ _id: room._id });
    }

    // Delete messages older than 10 days (even if room is not deleted)
    await Message.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
    });

    console.log("✅ Cron job cleanup completed");
  } catch (err) {
    console.error("❌ Cron cleanup failed:", err);
  }
});