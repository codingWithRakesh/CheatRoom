import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

import timeRouter from "./routes/time.route.js"

app.use("/api/v2/time", timeRouter)

app.get("/", (req, res) => {
  res.send("working")
})


export { app }