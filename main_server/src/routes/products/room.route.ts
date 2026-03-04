import { Router } from "express";
import {
    generateRoomCode,
    joinRoom,
    exitRoom,
    deteteRoom,
    changeAdminRoom
} from "../../controllers/products/room.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router: Router = Router();

router.route("/generate").post(generateRoomCode);
router.route("/join").post(joinRoom);
router.route("/exit").post(exitRoom);
router.route("/delete").delete(deteteRoom);

router.route("/change-admin").post(verifyAdmin, changeAdminRoom);

export default router;
