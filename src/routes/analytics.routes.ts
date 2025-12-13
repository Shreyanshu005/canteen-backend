import express from 'express';
import { getCanteenAnalytics, getEarningsBreakdown } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Analytics routes
router.get('/canteen/:canteenId', getCanteenAnalytics);
router.get('/canteen/:canteenId/earnings', getEarningsBreakdown);

export default router;
