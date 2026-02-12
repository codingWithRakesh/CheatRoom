import express from "express"
import cors, { CorsOptions } from "cors"
import cookieParser from "cookie-parser"
import session from "express-session";
import mongoose from "mongoose";

const app: express.Application = express()

const allowedOrigins: string[] = [
  process.env.CORS_ORIGIN || "http://localhost:5173",
  process.env.CORS_ORIGIN2 || "http://localhost:5174"
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};


app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
}));

import fingerprintRouter from "./routes/products/fingerprint.route.js"
import roomRouter from "./routes/products/room.route.js"
import messageRouter from "./routes/products/message.route.js"
import privateKeyRouter from "./routes/products/privateKeys.route.js"
import errorHandler from "./middlewares/error.middleware.js";

app.use("/api/v1/fingerprint", fingerprintRouter)
app.use("/api/v1/room", roomRouter)
app.use("/api/v1/message", messageRouter)
app.use("/api/v1/key", privateKeyRouter)

app.use(errorHandler);

app.get("/", (req: express.Request, res: express.Response): void => {
  res.json({ message: "working" });
})


export { app }