import express from 'express';
import { sendOtp, verifyOtp } from '../controllers/auth.controller';

const router = express.Router();

router.post('/email/send-otp', sendOtp);
router.post('/email/verify-otp', verifyOtp);

export default router;
