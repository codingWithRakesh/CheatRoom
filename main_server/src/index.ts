import connectDB from "./db/db.js";
import { server } from "./socket/socket.js";
import "./utils/cronDelete.js";

const PORT: number = Number(process.env.PORT) || 8000;

connectDB()
    .then((): void => {
        server.on("error", (err: Error) : void => {
            console.error(err);
        });

        server.listen(PORT, (): void => {
            console.log("Server running on port", PORT);
        });
    })
    .catch((err: Error) : void => {
        console.error("Connection failed", err.message);
    });
