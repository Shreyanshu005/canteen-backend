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
router.get('/:id', getCanteenById);

// Protected routes (authentication required)
router.post('/', protect, createOrUpdateCanteen);
router.get('/my-canteens', protect, getMyCanteens);
router.delete('/:id', protect, deleteCanteen);

export default router;
