import { Router } from 'express';
import { hashCodeToCode } from '../controller/hashCode.controller.js';

const router = Router();

router.route('/hashcode').post(hashCodeToCode);

export default router;