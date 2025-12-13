import express from 'express';
import {
    createOrUpdateCanteen,
    getAllCanteens,
    getCanteenById,
    deleteCanteen,
    getMyCanteens,
} from '../controllers/canteen.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllCanteens);

// 1. Specific Routes (Must come first)
router.get('/my-canteens', protect, getMyCanteens);

// 2. Wildcard Routes (Must come last)
router.get('/:id', getCanteenById);        // Public
router.post('/', protect, createOrUpdateCanteen);
router.delete('/:id', protect, deleteCanteen);

export default router;
