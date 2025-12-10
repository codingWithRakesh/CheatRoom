import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import { Fingerprint } from "../../models/products/fingerprint.model.js";

const registerFingerprint = asyncHandler(async (req, res) => {
  const { visitorId } = req.body;

  if (!visitorId) {
    throw new ApiError(400, "Visitor ID is required");
  }

  let fingerprint = await Fingerprint.findOne({ visitorId });

  if (!fingerprint) {
    fingerprint = await Fingerprint.create({
      visitorId,
      lastSeen: new Date()
    });
  } else {
    fingerprint.lastSeen = new Date();
    await fingerprint.save();
  }

  return res.status(201).json(
    new ApiResponse(201, fingerprint, "Fingerprint registered successfully")
  );
});

export { registerFingerprint };