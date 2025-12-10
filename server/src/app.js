import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session";
import passport from "passport";
import "./utils/passport.js"; // we create this file below
import mongoose from "mongoose";

const app = express()
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

import fingerprintRouter from "./routes/products/fingerprint.route.js"
import roomRouter from "./routes/products/room.route.js"
import messageRouter from "./routes/products/message.route.js"
import privateKeyRouter from "./routes/products/privateKeys.route.js"

app.use("/api/v1/fingerprint", fingerprintRouter)
app.use("/api/v1/room", roomRouter)
app.use("/api/v1/message", messageRouter)
app.use("/api/v1/key", privateKeyRouter)

app.get("/", (req, res) => {
  res.send("working")
})


export { app }