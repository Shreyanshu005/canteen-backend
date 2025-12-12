import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getCanteenOrders,
    verifyOrderQR as verifyQR,
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

// QR verification
router.post('/verify-qr', verifyQR);

export default router;
