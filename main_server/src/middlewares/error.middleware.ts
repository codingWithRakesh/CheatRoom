import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
  errors?: unknown[];
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const statusCode: number = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
};

export default errorHandler;
