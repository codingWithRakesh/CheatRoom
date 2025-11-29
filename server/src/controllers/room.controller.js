import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Room } from "../models/room.model.js"
import { PrivateKey } from "../models/privateKeys.model.js"
import { CryptoUtils } from "../utils/cryptoUtils.js";
import { Fingerprint } from "../models/fingerprint.model.js";
import mongoose from "mongoose";

const generateRoomCode = asyncHandler(async (req, res) => {
    const { publicKey, privateKey, visitorId } = req.body;
    if (!publicKey || !privateKey) {
        throw new ApiError(400, "publicKey and privateKey are required");
    }

    if(!visitorId){
        throw new ApiError(400, "visitorId is required");
    }

    let code;
    let codeHash;
    let exists;

    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        codeHash = CryptoUtils.hashRoomCode(code);
        exists = await Room.exists({ codeHash });
    } while (exists);

    const fingerprint = await Fingerprint.findOne({ visitorId });
    if (!fingerprint) {
        throw new ApiError(404, "Fingerprint not found");
    }

    const room = await Room.create({
        codeHash: codeHash,
        isAdminRoom : fingerprint._id,
        publicKey
    });
    
    if (!room) {
        throw new ApiError(500, "Failed to create room");
    }

    const key = await PrivateKey.create({
        roomID: room._id,
        privateKey: privateKey,
    })
    if (!key) {
        throw new ApiError(500, "Failed to create private key");
    }

    return res.status(201).json(
        new ApiResponse(201, { code: code }, "Room created successfully")
    );
});

const joinRoom = asyncHandler(async (req, res) => {
    const { code, visitorId } = req.body;

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }
    if (!visitorId) {
        throw new ApiError(400, "visitorId is required");
    }

    const codeHash = CryptoUtils.hashRoomCode(code);

    const room = await Room.findOne({ codeHash });
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
        new ApiResponse(200, { code: code }, "Joined room successfully")
    );
});

const exitRoom = asyncHandler(async (req, res) => {
    const { code, visitorId } = req.body;

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }
    if (!visitorId) {
        throw new ApiError(400, "visitorId is required");
    }

    const codeHash = CryptoUtils.hashRoomCode(code);

    const room = await Room.findOne({ codeHash });
    if (!room) {
        return res.status(404).json(
            new ApiError(404, "Room not found")
        );
    }

    room.participants = room.participants.filter(participant => participant !== visitorId);
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Exited room successfully")
    );
});

export {
    generateRoomCode,
    joinRoom,
    exitRoom
}