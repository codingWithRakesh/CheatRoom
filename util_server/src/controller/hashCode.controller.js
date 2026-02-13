import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { CryptoUtils } from "../utils/cryptoUtils.js";

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

export { hashCodeToCode };