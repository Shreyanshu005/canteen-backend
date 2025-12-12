import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getCanteenOrders,
    verifyOrderQR as verifyQR,
    completeOrderPickup,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Order routes
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/canteen/:canteenId', getCanteenOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', cancelOrder);

// QR verification and pickup
router.post('/verify-qr', verifyQR);
router.post('/pickup', completeOrderPickup);

export default router;
