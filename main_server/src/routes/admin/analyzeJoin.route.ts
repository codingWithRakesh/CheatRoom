import { Router } from "express";
import { 
    allRoom, 
    findRoomByCode, 
    deleteRoom, 
    allFingerprintMessageCount 
} from "../../controllers/admin/analyzeJoin.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.route("/rooms").get(verifyAdmin, allRoom);
router.route("/room").post(verifyAdmin, findRoomByCode);
router.route("/room").delete(verifyAdmin, deleteRoom);
router.route("/fingerprint-message-count").get(verifyAdmin, allFingerprintMessageCount);

export default router;