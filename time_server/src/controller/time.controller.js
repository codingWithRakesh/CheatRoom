import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getTime = asyncHandler(async (req, res, next) => {
  const currentTime = new Date().toISOString();
  return res.status(200).json(new ApiResponse(200, { currentTime }, "Current server time fetched successfully"));
});

export { getTime };