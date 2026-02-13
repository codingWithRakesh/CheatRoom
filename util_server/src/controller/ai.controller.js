import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { GoogleGenAI } from "@google/genai";

let ai = null;

function getGeminiClient() {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new ApiError(500, "Gemini API key is not configured");
        }
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }
    return ai;
}

async function geminiValue(content) {
    try {
        if (!content || typeof content !== 'string') {
            throw new Error("Invalid content provided");
        }

        const client = getGeminiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: content,
        });

        if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0]) {
            return response.candidates[0].content.parts[0].text || "";
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

const geminiValueController = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const result = await geminiValue(content);
    if (!result) {
        throw new ApiError(500, "Failed to generate content from Gemini API");
    }

    return res.status(200).json(new ApiResponse(200, { result }, "Content generated successfully"));

});

export { geminiValueController };