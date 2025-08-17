import { Router } from "express";
import {
    generateRoomCode,
    joinRoom,
    exitRoom
} from "../controllers/room.controller.js";

const router = Router();

router.route("/generate").get(generateRoomCode);
router.route("/join").post(joinRoom);
router.route("/exit").post(exitRoom);

export default router;
