import {asyncHandler} from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { Request, Response } from "express";
import { Room, IRoom } from "../../models/products/room.model.js";
import { Message, IMessage } from "../../models/products/message.model.js";
import { Fingerprint, IFingerprint } from "../../models/products/fingerprint.model.js"
import { CryptoUtils } from "../../utils/cryptoUtils.js";
import { deleteFromImageKit } from "../../utils/imageKit.js";
import { deleteFromCloudinary, getPublicId } from "../../utils/cloudinary.js";
import { PrivateKey } from "../../models/products/privateKeys.model.js";
import { AnalyzeJoin } from "../../models/analyze/analyzeJoin.model.js"

const allRoom = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    if (!req.admin) {
        throw new ApiError(401, "Admin not authenticated");
    }
    const rooms: IRoom[] = await Room.aggregate([
        {
            $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "roomID",
                as: "messages"
            }
        },
        {
            $lookup: {
                from: "AnalyzeJoins",
                localField: "_id",
                foreignField: "roomID",
                as: "analyzeJoins"
            }
        },
        {
            $project: {
                codeHash: 1,
                participants: 1,
                isAdminRoom: 1,
                publicKey: 1,
                createdAt: 1,
                messageCount: { $size: "$messages" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])
    if (!rooms || rooms.length === 0) {
        throw new ApiError(404, "No rooms found");
    }
    return res.status(200).json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
});

const findRoomByCode = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { code }: { code: string } = req.body;
    
    if (!req.admin) {
        throw new ApiError(401, "Admin not authenticated");
    }

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }

    const codeHash: string = CryptoUtils.hashRoomCode(code);

    const room: IRoom[] = await Room.aggregate([
        {
            $match: { codeHash }
        },
        {
            $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "roomID",
                as: "messages"
            }
        },
        {
            $project: {
                codeHash: 1,
                participants: 1,
                isAdminRoom: 1,
                publicKey: 1,
                createdAt: 1,
                messageCount: { $size: "$messages" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])

    if (!room || room.length === 0) {
        throw new ApiError(404, "Room not found");
    }

    return res.status(200).json(new ApiResponse(200, room[0], "Room fetched successfully"));
})

const deleteRoom = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { code }: { code: string } = req.body;

    if (!req.admin) {
        throw new ApiError(401, "Admin not authenticated");
    }

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }

    const codeHash: string = CryptoUtils.hashRoomCode(code);

    const room: IRoom | null = await Room.findOne({ codeHash });
    if (!room) {
        throw new ApiError(404, "Room not found");
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
    const isDeletedAnalyzeJoin: { deletedCount?: number } = await AnalyzeJoin.deleteMany({ roomId: room._id });

    if (!isDeletedRoom.deletedCount) {
        console.log(500, "Failed to delete room");
    }
    if (!isDeletedKey.deletedCount) {
        console.log(500, "Failed to delete private key");
    }
    if (!isDeletedMessages.deletedCount) {
        console.log(500, "Failed to delete messages");
    }
    if (!isDeletedAnalyzeJoin.deletedCount) {
        console.log(500, "Failed to delete analyze join records");
    }

    return res.status(200).json(
        new ApiResponse(200, { deleted: true }, "Room deleted successfully")
    );
});

const allFingerprintMessageCount = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const {code}: {code: string} = req.body;

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Code must be a 6-digit number");
    }

    if (!req.admin) {
        throw new ApiError(401, "Admin not authenticated");
    }

    const codeHash: string = CryptoUtils.hashRoomCode(code);

    const result = await Room.aggregate([
        { 
            $match: { codeHash } 
        },
        {
            $lookup: {
                from: "analyzejoins",
                localField: "_id",
                foreignField: "roomId",
                as: "analyzeJoins"
            }
        },
        {
            $match: {
                "analyzeJoins.0": { $exists: true }
            }
        },
        { 
            $unwind: "$analyzeJoins" 
        },
        {
            $lookup: {
                from: "fingerprints",
                localField: "analyzeJoins.visitorId",
                foreignField: "_id",
                as: "fingerprint"
            }
        },
        { 
            $unwind: {
                path: "$fingerprint",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $lookup: {
                from: "messages",
                let: { 
                    roomId: "$_id",
                    visitorIdString: "$fingerprint.visitorId"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$roomID", "$$roomId"] },
                                    { $eq: ["$senderId", "$$visitorIdString"] }
                                ]
                            }
                        }
                    }
                ],
                as: "messages"
            }
        },
        {
            $project: {
                _id: 0,
                visitorId: "$fingerprint.visitorId",
                fingerprintObjectId: "$fingerprint._id",
                countJoins: "$analyzeJoins.countJoins",
                messageCount: { $size: "$messages" }
            }
        },
        {
            $sort: { messageCount: -1 }
        }
    ]);

    if (!result || result.length === 0) {
        throw new ApiError(404, "No users found for this room or room does not exist");
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Message count retrieved successfully")
    );
})

export { 
    allRoom, 
    findRoomByCode, 
    deleteRoom, 
    allFingerprintMessageCount 
};