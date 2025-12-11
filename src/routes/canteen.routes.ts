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

// Apply auth middleware to all routes
router.use(protect);

router.post('/', createOrUpdateCanteen); // Handling create and update via query param
router.get('/', getAllCanteens);
router.get('/my-canteens', getMyCanteens); // Must be before /:id
router.get('/:id', getCanteenById);
router.delete('/:id', deleteCanteen);

export default router;
