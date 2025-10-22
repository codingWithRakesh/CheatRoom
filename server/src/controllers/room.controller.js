import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Room } from "../models/room.model.js"
import { io } from "../socket/socket.js";
import { isValidObjectId } from "mongoose";
import { PrivateKey } from "../models/privateKeys.model.js"

const generateRoomCode = asyncHandler(async (req, res) => {
    const { publicKey, privateKey } = req.body;
    if (!publicKey || !privateKey) {
        throw new ApiError(400, "publicKey and privateKey are required");
    }

    let code;
    let exists

    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        exists = await Room.exists({ code });
    } while (exists);

    const room = await Room.create({
        code,
        publicKey
    });
    if(!room){
        throw new ApiError(500, "Failed to create room");
    }

    const key = await PrivateKey.create({
        roomID : room._id,
        privateKey : privateKey,
    })
    if(!key){
        throw new ApiError(500, "Failed to create private key");
    }

    return res.status(201).json(
        new ApiResponse(201, { code: room.code }, "Room created successfully")
    );
});

const joinRoom = asyncHandler(async (req, res) => {
    const { code, visitorId } = req.body;

    const room = await Room.findOne({ code });
    if (!room) {
        return res.status(404).json(
            new ApiError(404, "Room not found")
        );
    }

    if (!room.participants.includes(visitorId)) {
        room.participants.push(visitorId);
        await room.save({ validateBeforeSave: true });
    }

    return res.status(200).json(
        new ApiResponse(200, { code: room.code }, "Joined room successfully")
    );
});

const exitRoom = asyncHandler(async (req, res) => {
    const { code, visitorId } = req.body;

    const room = await Room.findOne({ code });
    if (!room) {
        return res.status(404).json(
            new ApiError(404, "Room not found")
        );
    }

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