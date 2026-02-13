import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:5173",
  process.env.CORS_ORIGIN2 || "http://localhost:5174"
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

import timeRouter from "./routes/time.route.js"
import imageUploadRoute from "./routes/imageUpload.route.js"
import aiRoute from "./routes/ai.route.js"
import hashCodeRoute from "./routes/hashCode.route.js"

app.use("/api/v2/time", timeRouter)
app.use("/api/v2/image-upload", imageUploadRoute)
app.use("/api/v2/ai", aiRoute);
app.use("/api/v2/hash", hashCodeRoute);

app.get("/", (_, res) => {
  res.send("working")
})


export { app }