import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Message } from "../models/message.model.js"
import { Room } from "../models/room.model.js";
import { io } from "../socket/socket.js";
import { GoogleGenAI } from "@google/genai";

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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function geminiValue(content) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key is not configured");
        }

        if (!content || typeof content !== 'string') {
            throw new Error("Invalid content provided");
        }


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: content,
        });

        if (response && response.candidates && response.candidates[0]) {
            return response.candidates[0].content.parts[0].text;
        } else if (response && response.text) {
            return response.text;
        } else {
            throw new Error("Invalid response format from Gemini API");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new ApiError(500, `AI service error: ${error.message}`);
    }
}

const sendMessage = asyncHandler(async (req, res) => {
    const { content, senderId, roomCode, parentMessageId, isAI } = req.body;

    if (!content || !senderId || !roomCode) {
        throw new ApiError(400, "All fields are required");
    }

    const room = await Room.findOne({ code: roomCode });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const message = await Message.create({
        content: content,
        senderId,
        roomID: room._id,
        parentMessageId,
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
        if (participant !== senderId) {
            console.log("Sending message to:", participant);
            const socketuserName = `${participant}-${room.code}`;
            io.to(socketuserName).emit("message", messagedata[0]);
        }
    });

    let aiResponse;

    if (isAI) {
        try {
            aiResponse = await geminiValue(content);
            console.log("AI Response:", aiResponse);
            const aiMessage = await Message.create({
                content: aiResponse,
                senderId: "ai",
                roomID: room._id,
                parentMessageId: message._id,
                isAI
            });

            const aiMessageData = {
                ...aiMessage.toObject(),
                parentmessageContent: messagedata[0].content,
                isReply: true
            }

            room.participants.forEach(participant => {
                console.log("Sending message to:", participant);
                const socketuserName = `${participant}-${room.code}`;
                io.to(socketuserName).emit("message", aiMessageData);
            });
        } catch (error) {
            throw new ApiError(500, "Failed to generate AI response");
        }
    }



    res.status(201).json(new ApiResponse(201, messagedata[0], "Message sent successfully"));

});


export {
    getMessages,
    sendMessage
}