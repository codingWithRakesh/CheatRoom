import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import { Fingerprint, IFingerprint } from "../../models/products/fingerprint.model.js";
import { NextFunction, Request, Response } from "express";

const registerFingerprint = asyncHandler(async (req: Request, res: Response, next: NextFunction) : Promise<Response> => {
  const { visitorId }: { visitorId: string | null } = req.body;

  if (!visitorId) {
    throw new ApiError(400, "Visitor ID is required");
  }

  let fingerprint: IFingerprint | null = await Fingerprint.findOne({ visitorId });

  if (!fingerprint) {
    fingerprint = await Fingerprint.create({
      visitorId,
      lastSeen: new Date()
    });
  } else {
    fingerprint = await Fingerprint.findOneAndUpdate(
      { visitorId },
      { lastSeen: new Date() },
      { new: true }
    );
  }
  return res.status(201).json(
    new ApiResponse(201, fingerprint, "Fingerprint registered successfully")
  );
});

export { registerFingerprint };