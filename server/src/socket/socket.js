import { Server } from "socket.io";
import http from "http";
import { app } from "../app.js";
import { leaveRoom } from "../controllers/products/room.controller.js"
import userData from "../cache/data.js"
import { CryptoUtils } from "../utils/cryptoUtils.js";
import { Room } from "../models/products/room.model.js";

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ['GET', 'POST']
    },
    maxHttpBufferSize: 10 * 1024 * 1024,
    transports: ['websocket', 'polling'],
    pingInterval: 30000,
    pingTimeout: 10000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    }
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("message", ({ room, message }) => {
        console.log(`Message received in room ${room}: ${message}`);
        socket.to(room).emit("receive-message", { message });
    });

    socket.on("join-room", ({ userId, roomCode }) => {
        socket.join(userId);
        socket.join(roomCode);

        socket.data.userId = userId;
        socket.data.roomCode = roomCode;

        console.log(`Client ${userId} joined room: ${roomCode}`);
    });

    socket.on("typing", async ({ room, visitorId }) => {
        // const codeHash = CryptoUtils.hashRoomCode(room);
        // const roomD = await Room.findOne({ codeHash });

        // if (!roomD) return;

        // roomD.participants.forEach(participant => {
        //     if (participant !== visitorId) {
        //         const socketuserName = `${participant}-${room}`;
        //         io.to(socketuserName).emit("show_typing", { visitorId, isAi: false });
        //     }
        // });

        socket.to(room).emit("show_typing", {
            visitorId,
            isAi: false
        });
    });

    socket.on("stop_typing", async ({ room, visitorId }) => {
        // const codeHash = CryptoUtils.hashRoomCode(room);
        // const roomD = await Room.findOne({ codeHash });

        // roomD.participants.forEach(participant => {
        //     if (participant !== visitorId) {
        //         const socketuserName = `${participant}-${room}`;
        //         io.to(socketuserName).emit("hide_typing", { visitorId, isAi: false });
        //     }
        // });

        socket.to(room).emit("hide_typing", {
            visitorId,
            isAi: false
        });
    });

    socket.on("exit-room", async ({ roomCode, userId }) => {
        if (!roomCode || !userId) {
            console.log("Client attempted to exit room with missing data:", socket.id);
            return;
        }
        try {
            socket.leave(userId);
            socket.leave(roomCode);

            socket.data.userId = null;
            socket.data.roomCode = null;

            await leaveRoom(roomCode, userId);
        } catch (error) {
            console.error("Error leaving room on exit:", error);
        }
        console.log(`Client ${userId} left room: ${roomCode}`);
    });

    socket.on("connect_error", (err) => {
        console.log("Connection error:", err);
    });

    socket.on("disconnect", async () => {
        const { roomCode, userId } = socket.data;

        if (!roomCode || !userId) {
            console.log("Client disconnected:", socket.id);
            return;
        }

        try {
            socket.leave(userId);
            socket.leave(roomCode);

            socket.data.userId = null;
            socket.data.roomCode = null;

            await leaveRoom(roomCode, userId);
        } catch (error) {
            console.error("Error leaving room on disconnect:", error);
        }

        console.log("Client disconnected:", socket.id);
    });
});

export { server, io }
