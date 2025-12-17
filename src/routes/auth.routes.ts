import express from 'express';
import { sendOtp, verifyOtp, deleteAccount } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/email/send-otp', sendOtp);
router.post('/email/verify-otp', verifyOtp);
router.delete('/me', protect, deleteAccount);

export default router;
