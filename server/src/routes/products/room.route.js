import { Router } from "express";
import {
    generateRoomCode,
    joinRoom,
    exitRoom,
    deteteRoom,
    hashCodeToCode
} from "../../controllers/products/room.controller.js";

const router = Router();

router.route("/generate").post(generateRoomCode);
router.route("/join").post(joinRoom);
router.route("/exit").post(exitRoom);
router.route("/delete").delete(deteteRoom);

router.route("/hash-to-code").post(hashCodeToCode);

export default router;
