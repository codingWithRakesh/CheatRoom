import { Router } from "express";
import { getTime } from "../controller/time.controller.js";

const router = Router();

router.route("/current").get(getTime);

export default router;