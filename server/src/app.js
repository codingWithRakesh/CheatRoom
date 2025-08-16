import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173/",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

import fingerprintRouter from "./routes/fingerprint.route.js"
import roomRouter from "./routes/room.route.js"

app.use("/api/v1/fingerprint", fingerprintRouter)
app.use("/api/v1/room", roomRouter)

app.get("/", (req, res) => {
    res.send("working")
})


export { app }