import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Room } from "../models/room.model.js"
import { io } from "../socket/socket.js";
import { isValidObjectId } from "mongoose";

const generateRoomCode = asyncHandler(async (req, res) => {
    let code;
    let exists;

    // Generate unique 6-digit code
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        exists = await Room.exists({ code });
    } while (exists);

    // Create new room
    const room = await Room.create({
        code
    });

    return res.status(201).json(
        new ApiResponse(201, { code: room.code }, "Room created successfully")
    );
});

const joinRoom = asyncHandler(async (req, res) => {
    const { code, visitorId } = req.body;

    // Check if room exists
    const room = await Room.findOne({ code });
    if (!room) {
        return res.status(404).json(
            new ApiError(404, "Room not found")
        );
    }
    
    // Add user to room
    if(!room.participants.includes(visitorId)) {
        room.participants.push(visitorId);
        await room.save({ validateBeforeSave: true });
    }

    return res.status(200).json(
        new ApiResponse(200, { code: room.code }, "Joined room successfully")
    );
});

const exitRoom = asyncHandler(async (req, res) => {
    const { code, visitorId } = req.body;

    // Check if room exists
    const room = await Room.findOne({ code });
    if (!room) {
        return res.status(404).json(
            new ApiError(404, "Room not found")
        );
    }

    // Remove user from room
    room.participants = room.participants.filter(participant => participant !== visitorId);
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, { code: room.code }, "Exited room successfully")
    );
});

export {
    generateRoomCode,
    joinRoom,
    exitRoom
}