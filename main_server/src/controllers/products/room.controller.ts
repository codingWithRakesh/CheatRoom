import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import { Room } from "../../models/products/room.model.js"
import { IPrivateKey, PrivateKey } from "../../models/products/privateKeys.model.js"
import { CryptoUtils } from "../../utils/cryptoUtils.js";
import { Fingerprint, IFingerprint } from "../../models/products/fingerprint.model.js";
import mongoose, { ObjectId } from "mongoose";
import { IMessage, Message } from "../../models/products/message.model.js";
import { deleteFromImageKit } from "../../utils/imageKit.js";
import { deleteFromCloudinary, getPublicId } from "../../utils/cloudinary.js";
import userData from "../../cache/data.js"
import { IRoom } from "../../models/products/room.model.js";
import { NextFunction, Request, Response } from "express";

const generateRoomCode = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { publicKey, privateKey, visitorId }: { publicKey: string; privateKey: string; visitorId: string } = req.body;
    if (!publicKey || !privateKey) {
        throw new ApiError(400, "publicKey and privateKey are required");
    }

    if (!visitorId) {
        throw new ApiError(400, "visitorId is required");
    }

    let code: string;
    let codeHash: string;
    let exists : { _id: ObjectId } | null = null;

    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        codeHash = CryptoUtils.hashRoomCode(code);
        exists = await Room.exists({ codeHash });
    } while (exists !== null);

    const fingerprint: IFingerprint | null = await Fingerprint.findOne({ visitorId });
    if (!fingerprint) {
        throw new ApiError(404, "Fingerprint not found");
    }

    const room: IRoom = await Room.create({
        codeHash: codeHash,
        isAdminRoom: fingerprint._id,
        publicKey,
        participants: [visitorId]
    });

    if (!room) {
        throw new ApiError(500, "Failed to create room");
    }

    const key: IPrivateKey = await PrivateKey.create({
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

const joinRoom = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { code, visitorId }: { code: string; visitorId: string } = req.body;

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }
    if (!visitorId) {
        throw new ApiError(400, "visitorId is required");
    }

    userData.set("code", code);
    userData.set("visitorId", visitorId);

    const codeHash: string = CryptoUtils.hashRoomCode(code);

    const room: IRoom | null = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const updatedRoom: IRoom | null = await Room.findOneAndUpdate(
        { codeHash },
        { $addToSet: { participants: visitorId }, },
        { new: true }
    );
    if (!updatedRoom) {
        throw new ApiError(500, "Failed to join room");
    }

    return res.status(200).json(
        new ApiResponse(200, { code: code }, "Joined room successfully")
    );
});

const exitRoom = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { code, visitorId }: { code: string; visitorId: string } = req.body;

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }
    if (!visitorId) {
        throw new ApiError(400, "visitorId is required");
    }

    userData.delete("code");
    userData.delete("visitorId");

    const codeHash: string = CryptoUtils.hashRoomCode(code);

    const room: IRoom | null = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    room.participants = room.participants.filter(participant => participant !== visitorId);
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Exited room successfully")
    );
});

const deteteRoom = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { code, visitorId }: { code: string; visitorId: string } = req.body;

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }
    if (!visitorId) {
        throw new ApiError(400, "visitorId is required");
    }

    const codeHash: string = CryptoUtils.hashRoomCode(code);

    const room: IRoom | null = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const fingerprint: IFingerprint | null = await Fingerprint.findOne({ visitorId });
    if (!fingerprint) {
        throw new ApiError(404, "Fingerprint not found");
    }

    const isAdmin: boolean = room.isAdminRoom.toString() === fingerprint._id.toString();
    if (!isAdmin) {
        throw new ApiError(403, "You are not the admin of this room");
    }

    if (room.participants.length > 1) {
        throw new ApiError(403, "Cannot delete room with active participants");
    }

    const messages: IMessage[] = await Message.find({ roomID: room._id });

    for (const message of messages) {
        if (message.isFile) {
            if (message.fileId) {
                await deleteFromImageKit(message.fileId);
            } else {
                const publicId: string | null = getPublicId(message.content);
                if (publicId) {
                    await deleteFromCloudinary(publicId);
                }
            }
        }
    }

    const isDeletedMessages: { deletedCount?: number } = await Message.deleteMany({ roomID: room._id });
    const isDeletedKey: { deletedCount?: number } = await PrivateKey.deleteOne({ roomID: room._id });
    const isDeletedRoom: { deletedCount?: number } = await Room.deleteOne({ _id: room._id });

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

export const leaveRoom =  async (code: string, visitorId: string): Promise<boolean> => {
    try {
        const codeHash: string = CryptoUtils.hashRoomCode(code);

        const room: IRoom | null = await Room.findOneAndUpdate(
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

const changeAdminRoom = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { code, newVisitorId, secretKey }: { code: string; newVisitorId: string; secretKey: string } = req.body;

    if(secretKey !== process.env.SESSION_SECRET) {
        throw new ApiError(403, "Invalid secret key");
    }

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }

    if (!newVisitorId) {
        throw new ApiError(400, "newVisitorId is required");
    }

    const codeHash: string = CryptoUtils.hashRoomCode(code);
    const room: IRoom | null = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
    }
    const newFingerprint: IFingerprint | null = await Fingerprint.findOne({ visitorId: newVisitorId });
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
    changeAdminRoom
}