import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Room } from "../models/room.model.js";
import { PrivateKey } from "../models/privateKeys.model.js"
import mongoose from "mongoose";
import { CryptoUtils } from "../utils/cryptoUtils.js";

const createPrivateKey = asyncHandler(async (req, res, next) => {
    const { roomID, privateKey } = req.body;

    if (!roomID || !privateKey) {
        throw new ApiError(400, "roomID and privateKey are required");
    }

    if (!mongoose.Types.ObjectId.isValid(roomID)) {
        throw new ApiError(400, "Invalid roomID");
    }

    const existPrimaryKey = await PrivateKey.findOne({ privateKey, roomID })
    if (existPrimaryKey) {
        throw new ApiError(400, "Private key already exists for this room");
    }

    const newPrivateKey = await PrivateKey.create({ roomID, privateKey });
    if (!newPrivateKey) {
        throw new ApiError(500, "Failed to create private key");
    }

    return res.status(201).json(new ApiResponse(201, newPrivateKey, "Private key created successfully"));
})

const updatePrivateKeyById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { privateKey } = req.body;
    if (!privateKey) {
        throw new ApiError(400, "privateKey is required");
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid private key ID");
    }
    const updatedPrivateKey = await PrivateKey.findByIdAndUpdate(id, { privateKey }, { new: true });
    if (!updatedPrivateKey) {
        throw new ApiError(404, "Private key not found");
    }
    return res.status(200).json(new ApiResponse(200, updatedPrivateKey, "Private key updated successfully"));

})

const updatePrivateKeyByRoomId = asyncHandler(async (req, res, next) => {
    const { roomID } = req.params;
    const { privateKey } = req.body;

    if (!roomID || !privateKey) {
        throw new ApiError(400, "roomID and privateKey are required");
    }

    if (!mongoose.Types.ObjectId.isValid(roomID)) {
        throw new ApiError(400, "Invalid roomID");
    }

    const updatedPrivateKey = await PrivateKey.findOneAndUpdate({ roomID }, { privateKey }, { new: true });
    if (!updatedPrivateKey) {
        throw new ApiError(404, "Private key not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedPrivateKey, "Private key updated successfully"));
})

const getPrivateKeyByRoomId = asyncHandler(async (req, res, next) => {
    const { roomID } = req.params;
    if (!roomID) {
        throw new ApiError(400, "roomID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(roomID)) {
        throw new ApiError(400, "Invalid roomID");
    }
    const privateKey = await PrivateKey.findOne({ roomID });
    if (!privateKey) {
        throw new ApiError(404, "Private key not found for this room");
    }
    return res.status(200).json(new ApiResponse(200, privateKey, "Private key fetched successfully"));
})

// Get public key by room code
const getPublicKeyByRoomCode = asyncHandler(async (req, res, next) => {
    const { roomCode } = req.params;

    if (!roomCode || !/^[0-9]{6}$/.test(roomCode)) {
        throw new ApiError(400, "roomCode must be a 6-digit number");
    }

    const codeHash = CryptoUtils.hashRoomCode(roomCode);

    const room = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { publicKey: room.publicKey }, "Public key fetched successfully")
    );
});

// Get private key by room code
const getPrivateKeyByRoomCode = asyncHandler(async (req, res, next) => {
    const { roomCode } = req.params;

    if (!roomCode || !/^[0-9]{6}$/.test(roomCode)) {
        throw new ApiError(400, "roomCode must be a 6-digit number");
    }

    const codeHash = CryptoUtils.hashRoomCode(roomCode);

    const room = await Room.aggregate([
        {
            $match: {
                codeHash
            }
        },
        {
            $lookup: {
                from: "privatekeys",
                localField: "_id",
                foreignField: "roomID",
                as: "privateKeyDetails"
            }
        }
    ]);

    if (!room || room.length === 0) {
        throw new ApiError(404, "Room not found");
    }

    if (!room[0].privateKeyDetails || room[0].privateKeyDetails.length === 0) {
        throw new ApiError(404, "Private key not found for this room");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            room[0].privateKeyDetails[0].privateKey,
            "Private key fetched successfully"
        )
    );
});

const deletePrivateKeyById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid id");
    }

    const privateKey = await PrivateKey.findByIdAndDelete(id);
    if(!privateKey){
        throw new ApiError(404, "Private key not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "delete successfully"))
})


export {
    createPrivateKey,
    updatePrivateKeyById,
    updatePrivateKeyByRoomId,
    getPrivateKeyByRoomId,
    getPublicKeyByRoomCode,
    getPrivateKeyByRoomCode,
    deletePrivateKeyById
}