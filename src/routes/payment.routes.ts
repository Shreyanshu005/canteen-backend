import express from 'express';
import {
    initiatePayment,
    verifyPayment,
    handleWebhook,
} from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Protected routes
router.post('/initiate', protect, initiatePayment);
router.post('/verify', protect, verifyPayment);

// Webhook route (public but verified internally)
router.post('/webhook', handleWebhook);

export default router;
