import dotenv from "dotenv"
import connectDB from './src/db/db.js'
import { server } from "./src/socket/socket.js"
import "./src/utils/cronDelete.js"
dotenv.config({path : "./.env"})

const PORT = process.env.PORT || 8000

connectDB().then(() => {
    server.on("error", (err)=>{
        console.log(err)
    })
    server.listen(PORT,()=>{
        console.log("server running",PORT)
    })
}).catch((err) => {
    console.log("connection failed", err?.message)
})