import {Server} from "socket.io";
import http from "http";
import { app } from "../app.js";
import { leaveRoom } from "../controllers/products/room.controller.js"
import userData from "../cache/data.js"

const server = http.createServer(app);
const io = new Server(server, {
    cors :{
        origin : process.env.CORS_ORIGIN || "http://localhost:5173",
        methods : ['GET','POST']
    }
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("message", ({room, message}) => {
        console.log(`Message received in room ${room}: ${message}`);
        socket.to(room).emit("receive-message", {message});
    });

    socket.on("join-room", (visitorId) => {
        socket.join(visitorId);
        console.log(`Client ${socket.id} joined room: ${visitorId}`);
    });

    socket.on("connect_error", (err) => {
        console.log("Connection error:", err);
    });

    socket.on("disconnect", async () => {
        const code = userData.get("code");
        const visitorId = userData.get("visitorId");

        if (code && visitorId) {
            console.log({code, visitorId});
            try {
                const success = await leaveRoom(code, visitorId);
                if (success) {
                    userData.delete("code");
                    userData.delete("visitorId");
                }
            } catch (error) {
                console.error("Error leaving room on disconnect:", error);
            }
        }
        
        console.log("Client disconnected:", socket.id);
    });
});

export {server, io}
