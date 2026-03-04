import { Router } from 'express';
import { hashCodeToCode } from '../controller/hashCode.controller.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js';

const router = Router();

router.route('/hashcode').post(verifyAdmin, hashCodeToCode);

export default router;