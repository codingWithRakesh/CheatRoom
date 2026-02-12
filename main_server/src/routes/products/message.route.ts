import { Router } from "express";
import {
    getMessages,
    sendMessage,
    uploadFile
} from "../../controllers/products/message.controller.js";
import {upload} from "../../middlewares/multer.middleware.js"

const router: Router = Router();

router.route("/allMessages/:code").get(getMessages);
router.route("/sendMessage").post(sendMessage);
router.route("/upload").post(upload.single("file"), uploadFile);

export default router;