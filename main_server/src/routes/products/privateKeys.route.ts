import { Router } from "express";
import {
    createPrivateKey,
    updatePrivateKeyById,
    updatePrivateKeyByRoomId,
    getPrivateKeyByRoomId,
    getPublicKeyByRoomCode,
    getPrivateKeyByRoomCode,
    deletePrivateKeyById
} from "../../controllers/products/privateKeys.controller.js"

const router: Router = Router();

router.route("/create").post(createPrivateKey);
router.route("/update/:id").put(updatePrivateKeyById);
router.route("/update/:roomID").put(updatePrivateKeyByRoomId);
router.route("/getByRoomId/:roomID").get(getPrivateKeyByRoomId);

router.route("/getPublicKey/:roomCode").get(getPublicKeyByRoomCode); // for fetching public key
router.route("/getByRoomCode/:roomCode").get(getPrivateKeyByRoomCode); // for fetching private key

router.route("/delete/:id").delete(deletePrivateKeyById);

export default router;