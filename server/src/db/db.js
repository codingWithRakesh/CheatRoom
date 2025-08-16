import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connectionIn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("mongoDB connected",connectionIn.connection.host)
    } catch (error) {
        console.log("MongoDB Failed",error?.message)
        process.exit(1)
    }
}

export default connectDB