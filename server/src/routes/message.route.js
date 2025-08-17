import { Router } from "express";
import {
    getMessages,
    sendMessage
} from "../controllers/message.controller.js";

const router = Router();

router.route("/allMessages/:code").get(getMessages);
router.route("/sendMessage").post(sendMessage);

export default router;