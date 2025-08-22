import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Message } from "../models/message.model.js"
import { Room } from "../models/room.model.js";
import { io } from "../socket/socket.js";

const getMessages = asyncHandler(async (req, res) => {
    const { code } = req.params;
    if (!code) {
        throw new ApiError(400, "Room code is required");
    }

    const messages = await Room.aggregate([
        {
            $match: {
                code
            }
        },
        {
            $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "roomID",
                as: "messages",
                pipeline: [
                    {
                        $lookup: {
                            from: "messages",
                            localField: "parentMessageId",
                            foreignField: "_id",
                            as: "parentMessage",
                        }
                    },
                    {
                        $addFields: {
                            parentmessageContent: { $arrayElemAt: ["$parentMessage.content", 0] },
                            isReply: { $cond: { if: { $gt: [{ $size: "$parentMessage" }, 0] }, then: true, else: false } }
                        }
                    },
                    {
                        $project: {
                            parentMessage: 0,
                        }
                    },
                ]
            }
        }
    ]);

    if (!messages || messages.length === 0) {
        throw new ApiError(404, "No messages found");
    }

    res.status(200).json(new ApiResponse(200, messages, "Messages retrieved successfully"));
});

const sendMessage = asyncHandler(async (req, res) => {
    const { content, senderId, roomCode, parentMessageId } = req.body;

    if (!content || !senderId || !roomCode) {
        throw new ApiError(400, "All fields are required");
    }

    const room = await Room.findOne({ code: roomCode });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const message = await Message.create({
        content,
        senderId,
        roomID: room._id,
        parentMessageId
    });

    if (!message) {
        throw new ApiError(500, "Failed to send message");
    }

    const messagedata = await Message.aggregate([
        {
            $match: {
                _id: message._id
            }
        },
        {
            $lookup: {
                from: "messages",
                localField: "parentMessageId",
                foreignField: "_id",
                as: "parentMessage",
            }
        },
        {
            $addFields: {
                parentmessageContent: { $arrayElemAt: ["$parentMessage.content", 0] },
                isReply: { $cond: { if: { $gt: [{ $size: "$parentMessage" }, 0] }, then: true, else: false } }
            }
        },
        {
            $project: {
                parentMessage: 0,
            }
        },
    ])

    room.participants.forEach(participant => {
        console.log("Sending message to:", participant);
        const socketuserName = `${participant}-${room.code}`;
        io.to(socketuserName).emit("message", messagedata[0]);
    });

    res.status(201).json(new ApiResponse(201, messagedata[0], "Message sent successfully"));

});


export {
    getMessages,
    sendMessage
}