import express from 'express';
import {
    addMenuItem,
    updateMenuItem,
    updateItemQuantity,
    deleteMenuItem,
    getCanteenMenu,
    getMenuItem,
} from '../controllers/menu.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/canteen/:canteenId', getCanteenMenu);
router.get('/canteen/:canteenId/item/:itemId', getMenuItem);

// Protected routes (authentication required)
router.post('/canteen/:canteenId', protect, addMenuItem);
router.put('/canteen/:canteenId/item/:itemId', protect, updateMenuItem);
router.patch('/canteen/:canteenId/item/:itemId/quantity', protect, updateItemQuantity);
router.delete('/canteen/:canteenId/item/:itemId', protect, deleteMenuItem);

export default router;
