"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const canteen_controller_1 = require("../controllers/canteen.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.get('/', canteen_controller_1.getAllCanteens);
// 1. Specific Routes (Must come first)
router.get('/my-canteens', auth_middleware_1.protect, canteen_controller_1.getMyCanteens);
// 2. Wildcard Routes (Must come last)
router.get('/:id', canteen_controller_1.getCanteenById); // Public
router.post('/', auth_middleware_1.protect, canteen_controller_1.createOrUpdateCanteen);
router.patch('/:id/status', auth_middleware_1.protect, canteen_controller_1.toggleCanteenStatus); // NEW: Toggle Status
router.delete('/:id', auth_middleware_1.protect, canteen_controller_1.deleteCanteen);
exports.default = router;
//# sourceMappingURL=canteen.routes.js.map