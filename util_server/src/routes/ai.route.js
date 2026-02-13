import { Router } from "express";
import { geminiValueController } from "../controller/ai.controller.js";

const router = Router();

router.route("/gemini").post(geminiValueController);

export default router;