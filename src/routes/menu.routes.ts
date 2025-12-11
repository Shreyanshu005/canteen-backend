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

router.use(protect);

router.post('/canteen/:canteenId', addMenuItem);
router.put('/canteen/:canteenId/item/:itemId', updateMenuItem);
router.patch('/canteen/:canteenId/item/:itemId/quantity', updateItemQuantity);
router.delete('/canteen/:canteenId/item/:itemId', deleteMenuItem);
router.get('/canteen/:canteenId', getCanteenMenu);
router.get('/canteen/:canteenId/item/:itemId', getMenuItem);

export default router;
