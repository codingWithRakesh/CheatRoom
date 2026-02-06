import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import { Room } from "../../models/products/room.model.js"
import { PrivateKey } from "../../models/products/privateKeys.model.js"
import { CryptoUtils } from "../../utils/cryptoUtils.js";
import { Fingerprint } from "../../models/products/fingerprint.model.js";
import mongoose from "mongoose";
import { Message } from "../../models/products/message.model.js";
import { deleteFromImageKit } from "../../utils/imageKit.js";
import { deleteFromCloudinary, getPublicId } from "../../utils/cloudinary.js";
import userData from "../../cache/data.js"

const generateRoomCode = asyncHandler(async (req, res) => {
    const { publicKey, privateKey, visitorId } = req.body;
    if (!publicKey || !privateKey) {
        throw new ApiError(400, "publicKey and privateKey are required");
    }

    if (!visitorId) {
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
        isAdminRoom: fingerprint._id,
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

    userData.set("code", code);
    userData.set("visitorId", visitorId);

    const codeHash = CryptoUtils.hashRoomCode(code);

    const room = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
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

    userData.delete("code");
    userData.delete("visitorId");

    const codeHash = CryptoUtils.hashRoomCode(code);

    const room = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    room.participants = room.participants.filter(participant => participant !== visitorId);
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Exited room successfully")
    );
});

const deteteRoom = asyncHandler(async (req, res) => {
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
        throw new ApiError(404, "Room not found");
    }

    const fingerprint = await Fingerprint.findOne({ visitorId });
    if (!fingerprint) {
        throw new ApiError(404, "Fingerprint not found");
    }

    const isAdmin = room.isAdminRoom.toString() === fingerprint._id.toString();
    if (!isAdmin) {
        throw new ApiError(403, "You are not the admin of this room");
    }

    if (room.participants.length > 2) {
        throw new ApiError(403, "Cannot delete room with active participants");
    }

    const messages = await Message.find({ roomID: room._id });

    for (const message of messages) {
        if (message.isFile) {
            if (message.fileId) {
                await deleteFromImageKit(message.fileId);
            } else {
                const publicId = getPublicId(message.content);
                await deleteFromCloudinary(publicId);
            }
        }
    }

    const isDeletedMessages = await Message.deleteMany({ roomID: room._id });
    const isDeletedKey = await PrivateKey.deleteOne({ roomID: room._id });
    const isDeletedRoom = await Room.deleteOne({ _id: room._id });

    if (!isDeletedRoom.deletedCount) {
        console.log(500, "Failed to delete room");
    }
    if (!isDeletedKey.deletedCount) {
        console.log(500, "Failed to delete private key");
    }
    if (!isDeletedMessages.deletedCount) {
        console.log(500, "Failed to delete messages");
    }

    return res.status(200).json(
        new ApiResponse(200, { isAdmin }, "Room deleted successfully")
    );
});

export const leaveRoom = async (code, visitorId) => {
    try {
        const codeHash = CryptoUtils.hashRoomCode(code);

        const room = await Room.findOneAndUpdate(
            { codeHash },
            { $pull: { participants: visitorId } },
            { new: true }
        );

        if (!room) {
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error leaving room:", error);
        return false;
    }
};

const hashCodeToCode = asyncHandler(async (req, res) => {
    const { codeHash, secretKey } = req.body;

    if (!codeHash || !secretKey) {
        throw new ApiError(400, "codeHash and secretKey are required");
    }

    if(secretKey !== process.env.SESSION_SECRET) {
        throw new ApiError(403, "Invalid secret key");
    }

    if(codeHash.length != 64){
        throw new ApiError(403, "Invalid HashCode");
    }

    let guessedCode = null;
    let attempts = 0;

    while (true) {
        attempts++;

        const guess = Math.floor(100000 + Math.random() * 900000).toString();
        const guessHash = CryptoUtils.hashRoomCode(guess);

        if (guessHash === codeHash) {
            guessedCode = guess;
            break;
        }
    }

    return res.status(200).json(
        new ApiResponse(200, { guessedCode, attempts }, "Code guessed successfully")
    );
});

const changeAdminRoom = asyncHandler(async (req, res) => {
    const { code, newVisitorId, secretKey } = req.body;

    if(secretKey !== process.env.SESSION_SECRET) {
        throw new ApiError(403, "Invalid secret key");
    }

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }

    if (!newVisitorId) {
        throw new ApiError(400, "newVisitorId is required");
    }

    const codeHash = CryptoUtils.hashRoomCode(code);
    const room = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }
    const newFingerprint = await Fingerprint.findOne({ visitorId: newVisitorId });
    if (!newFingerprint) {
        throw new ApiError(404, "Fingerprint not found");
    }
    room.isAdminRoom = newFingerprint._id;
    await room.save();
    return res.status(200).json(
        new ApiResponse(200, null, "Admin changed successfully")
    );
});


export {
    generateRoomCode,
    joinRoom,
    exitRoom,
    deteteRoom,
    hashCodeToCode,
    changeAdminRoom
}