import cron from "node-cron";
import { Room } from "../models/room.model.js";
import { Message } from "../models/message.model.js";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    // 1) Delete expired Rooms manually (if you remove TTL)
    const expiredRooms = await Room.find({
      createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
    });

    for (const room of expiredRooms) {
      await Message.deleteMany({ roomID: room._id });
      await Room.deleteOne({ _id: room._id });
    }

    // 2) Extra cleanup: remove orphan messages
    const rooms = await Room.find().select("_id");
    const roomIds = rooms.map(r => r._id);
    await Message.deleteMany({ roomID: { $nin: roomIds } });

    if (expiredRooms.length > 0) {
      console.log(`🗑 Deleted ${expiredRooms.length} rooms and their messages`);
    }

  } catch (err) {
    console.error("Cron job error:", err);
  }
});
