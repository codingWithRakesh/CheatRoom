import { Router } from "express";
import { registerFingerprint } from "../controllers/fingerprint.controller.js";

const router = Router();

router.route("/register").post(registerFingerprint);

export default router;
