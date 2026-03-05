import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyAdmin = asyncHandler(async (req, _, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Admin token is missing");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN || "secret");
        if (decoded.username !== process.env.ADMIN_USERNAME) {
            throw new ApiError(401, "Invalid admin token");
        }
        req.admin = decoded;
        next();
    } catch (err) {
        throw new ApiError(401, "Invalid admin token");
    }
});

export { verifyAdmin };