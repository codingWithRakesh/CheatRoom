import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadToImageKit,deleteFromImageKit } from "../utils/imageKit.js";

const uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }
    const { buffer, mimetype, originalname, size } = req.file;
    if (!buffer || !mimetype) throw new ApiError(400, "Invalid file");
    const fileName = originalname || `file_${Date.now()}`;
    const result = await uploadToImageKit(buffer, fileName);
    if (!result?.url) throw new ApiError(500, "ImageKit document upload failed");
    const fileUrl = result.url;
    const fileId = result.fileId;
    return res
        .status(200)
        .json(new ApiResponse(200, { fileUrl, fileId, size, mimetype }, "Image uploaded successfully"));
});

const deleteImage = asyncHandler(async (req, res, next) => {
    const { fileId } = req.body;
    if (!fileId) {
        throw new ApiError(400, "fileId is required for deletion");
    }
    const result = await deleteFromImageKit(fileId);
    if (!result) {
        throw new ApiError(500, "Failed to delete image from ImageKit");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, result, "Image deleted successfully"));
});

export { uploadImage, deleteImage };