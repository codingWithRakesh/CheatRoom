import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Message } from "../models/message.model.js"
import { Room } from "../models/room.model.js";
import { io } from "../socket/socket.js";
import { GoogleGenAI } from "@google/genai";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { uploadToImageKit } from "../utils/imageKit.js"
import sharp from "sharp";
import zlib from "zlib";
import { CryptoUtils } from "../utils/cryptoUtils.js";

const getMessages = asyncHandler(async (req, res) => {
    const { code } = req.params;

    if (!code || !/^[0-9]{6}$/.test(code)) {
        throw new ApiError(400, "Room code must be a 6-digit number");
    }

    const codeHash = CryptoUtils.hashRoomCode(code);

    const messages = await Room.aggregate([
        {
            $match: {
                codeHash
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
                            isReply: {
                                $cond: {
                                    if: { $gt: [{ $size: "$parentMessage" }, 0] },
                                    then: true,
                                    else: false
                                }
                            }
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

const bufferToBase64 = (buffer, mimetype) =>
    `data:${mimetype};base64,${buffer.toString("base64")}`;

function calculateImageQuality(originalSize, targetSize) {
    const sizeRatio = targetSize / originalSize;
    let quality = Math.floor(70 * sizeRatio);
    return Math.max(10, Math.min(90, quality));
}

const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "No file uploaded");

    const { buffer, mimetype, originalname, size } = req.file;
    const { senderId, roomCode } = req.body;

    if (!senderId || !roomCode) {
        throw new ApiError(400, "Sender ID and Room Code are required");
    }

    if (!/^[0-9]{6}$/.test(roomCode)) {
        throw new ApiError(400, "Room code must be a 6-digit number");
    }

    if (!buffer || !mimetype) throw new ApiError(400, "Invalid file");

    const allowedImageVideoAudioTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
        "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv",
        "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/aac", "audio/mp4"
    ];

    const allowedDocumentTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "application/rtf",

        "application/zip",
        "application/x-zip-compressed",
        "multipart/x-zip",
        "application/x-compressed",

        "application/json",
        "application/xml",
        "text/xml",
        "application/x-yaml",
        "text/yaml",
        "text/x-yaml",
        "text/html",
        "text/css",

        "text/javascript",
        "application/javascript",
        "application/x-javascript",
        "application/x-typescript",
        "text/typescript",

        "text/x-c",
        "text/x-csrc",
        "text/x-c++",
        "text/x-c++src",

        "text/x-java-source",

        "text/x-python",

        "text/x-php",
        "application/x-httpd-php",

        "text/x-ruby",

        "text/x-go",

        "text/x-rustsrc",

        "text/x-sql",
        "application/sql",

        "text/x-shellscript",
        "application/x-sh",
        "application/x-bash",

        "text/markdown",
        "text/x-markdown"
    ];

    if (![...allowedImageVideoAudioTypes, ...allowedDocumentTypes].includes(mimetype)) {
        throw new ApiError(400, `Unsupported file type: ${mimetype}`);
    }

    const MAX_SIZES = {
        image: 5 * 1024 * 1024,     // 5MB
        video: 15 * 1024 * 1024,    // 15MB
        audio: 10 * 1024 * 1024,    // 10MB
        document: 20 * 1024 * 1024  // 20MB
    };

    const codeHash = CryptoUtils.hashRoomCode(roomCode);
    const room = await Room.findOne({ codeHash });
    if (!room) throw new ApiError(404, "Room not found");

    let processedBuffer = buffer;
    let fileUrl;
    let fileId;

    if (mimetype.startsWith("image/")) {
        if (size > MAX_SIZES.image) throw new ApiError(400, "Image size must be less than 5MB");

        const targetQuality = calculateImageQuality(size, 1 * 1024 * 1024);
        processedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: targetQuality, progressive: true, optimiseScans: true })
            .toBuffer();

        const base64File = bufferToBase64(processedBuffer, mimetype);
        const result = await uploadOnCloudinary(base64File, "image");

        if (!result?.secure_url) throw new ApiError(500, "Cloudinary image upload failed");
        fileUrl = result.secure_url;

    } else if (mimetype.startsWith("video/")) {
        if (size > MAX_SIZES.video) throw new ApiError(400, "Video size must be less than 15MB");

        const base64File = bufferToBase64(buffer, mimetype);
        const result = await uploadOnCloudinary(base64File, "video");

        if (!result?.secure_url) throw new ApiError(500, "Cloudinary video upload failed");
        fileUrl = result.secure_url;

    } else if (mimetype.startsWith("audio/")) {
        if (size > MAX_SIZES.audio) throw new ApiError(400, "Audio size must be less than 10MB");

        const base64File = bufferToBase64(buffer, mimetype);
        const result = await uploadOnCloudinary(base64File, "audio");

        if (!result?.secure_url) throw new ApiError(500, "Cloudinary audio upload failed");
        fileUrl = result.secure_url;

    } else if (allowedDocumentTypes.includes(mimetype)) {
        if (size > MAX_SIZES.document) throw new ApiError(400, "Document size must be less than 20MB");

        const fileName = originalname || `file_${Date.now()}`;
        const result = await uploadToImageKit(buffer, fileName);

        if (!result?.url) throw new ApiError(500, "ImageKit document upload failed");
        fileUrl = result.url;
        fileId = result.fileId;
    } else {
        throw new ApiError(400, "Unsupported file type");
    }

    const message = await Message.create({
        content: fileUrl,
        senderId,
        roomID: room._id,
        isFile: true,
        fileName: originalname || `file_${Date.now()}`,
        fileType: mimetype,
        fileId: fileId || null
    });

    if (!message) throw new ApiError(500, "Failed to send message");

    const messagedata = await Message.aggregate([
        { $match: { _id: message._id } },
        {
            $lookup: {
                from: "messages",
                localField: "parentMessageId",
                foreignField: "_id",
                as: "parentMessage"
            }
        },
        {
            $addFields: {
                parentmessageContent: { $arrayElemAt: ["$parentMessage.content", 0] },
                isReply: {
                    $cond: {
                        if: { $gt: [{ $size: "$parentMessage" }, 0] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        { $project: { parentMessage: 0 } }
    ]);

    room.participants.forEach(participant => {
        if (participant !== senderId) {
            const socketuserName = `${participant}-${roomCode}`; // still using real code
            io.to(socketuserName).emit("message", messagedata[0]);
        }
    });

    res.status(200).json(new ApiResponse(200, messagedata[0], "Upload successful"));
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

    if (!/^[0-9]{6}$/.test(roomCode)) {
        throw new ApiError(400, "Room code must be a 6-digit number");
    }

    const codeHash = CryptoUtils.hashRoomCode(roomCode);
    const room = await Room.findOne({ codeHash });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const message = await Message.create({
        content,
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
                isReply: {
                    $cond: {
                        if: { $gt: [{ $size: "$parentMessage" }, 0] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                parentMessage: 0,
            }
        },
    ]);

    room.participants.forEach(participant => {
        if (participant !== senderId) {
            const socketuserName = `${participant}-${roomCode}`;
            io.to(socketuserName).emit("message", messagedata[0]);
        }
    });

    let aiResponse;

    if (isAI) {
        try {
            aiResponse = await geminiValue(content);
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
            };

            room.participants.forEach(participant => {
                const socketuserName = `${participant}-${roomCode}`;
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
    sendMessage,
    uploadFile
}