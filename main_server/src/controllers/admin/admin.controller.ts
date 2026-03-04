import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { options } from "../../constants.js"
import jwt from "jsonwebtoken";

const adminID = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

const adminLogin = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { username, password }: { username: string; password: string } = req.body;
    if(!username || !password) {
        throw new ApiError(400, "username and password are required");
    }
    if(username !== adminID || password !== adminPassword) {
        throw new ApiError(401, "Invalid admin credentials");
    }

    const token = jwt.sign(
        { username },
        process.env.JWT_SECRET_ADMIN as string || "secret",
        { expiresIn: Number(process.env.JWT_EXPIRY_ADMIN) || 3600 }
    );

    return res
        .status(200)
        .cookie("adminToken", token, options)
        .json(new ApiResponse(200, { token }, "Admin login successful"));
});

const checkAdminAuth = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    if (!req.admin) {
        throw new ApiError(401, "Admin not authenticated");
    }
    return res.status(200).json(new ApiResponse(200, { username: req.admin.username }, "Admin authenticated"));
});

const adminLogout = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    if (!req.admin) {
        throw new ApiError(401, "Admin not authenticated");
    }
    res.clearCookie("adminToken", options);
    return res.status(200).json(new ApiResponse(200, null, "Admin logged out successfully"));
});

export { adminLogin, checkAdminAuth, adminLogout };