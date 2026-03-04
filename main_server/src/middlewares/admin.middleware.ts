import { ApiError } from "../utils/apiError.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

declare global {
  namespace Express {
    interface Request {
      admin?: { username: string };
    }
  }
}

const verifyAdmin = asyncHandler(async (req: Request, _: Response, next: NextFunction): Promise<Response | void> => {
    const token = req.cookies.adminToken;
    if (!token) {
        throw new ApiError(401, "Admin token is missing");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN as string || "secret") as { username: string; iat: number; exp: number };
        if (decoded.username !== process.env.ADMIN_USERNAME) {
            throw new ApiError(401, "Invalid admin token");
        }
        req.admin = { username: decoded.username };
        next();
    } catch (err) {
        throw new ApiError(401, "Invalid admin token");
    }
});

export { verifyAdmin };