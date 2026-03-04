import { Router } from "express";
import { adminLogin,checkAdminAuth, adminLogout } from "../../controllers/admin/admin.controller.js";
import { verifyAdmin } from "../../middlewares/admin.middleware.js";

const router: Router = Router();

router.route("/login").post(adminLogin);
router.route("/auth").get(verifyAdmin, checkAdminAuth);
router.route("/logout").post(verifyAdmin, adminLogout);

export default router;