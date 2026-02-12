import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { Room } from "../models/products/room.model.js";

const connectDB = async (): Promise<void> => {
    try {
        const connectionIn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
            maxPoolSize: 20,
            minPoolSize: 10,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
        } as mongoose.ConnectOptions);
        console.log("mongoDB connected", connectionIn.connection.host, "with pool size: 20")

        await Room.syncIndexes();
        console.log("Room indexes synced!");
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("MongoDB Failed", error.message);
        } else {
            console.error("MongoDB Failed", error);
        }
        process.exit(1)
    }
}

export default connectDB