import { Router } from "express";
import { 
    uploadImage,
    deleteImage
} from "../controller/imageUpload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(upload.single("image"), uploadImage);
router.route("/delete").delete(deleteImage);

export default router;