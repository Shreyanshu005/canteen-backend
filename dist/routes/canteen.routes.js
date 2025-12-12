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
router.get('/:id', canteen_controller_1.getCanteenById);
// Protected routes (authentication required)
router.post('/', auth_middleware_1.protect, canteen_controller_1.createOrUpdateCanteen);
router.get('/my-canteens', auth_middleware_1.protect, canteen_controller_1.getMyCanteens);
router.delete('/:id', auth_middleware_1.protect, canteen_controller_1.deleteCanteen);
exports.default = router;
//# sourceMappingURL=canteen.routes.js.map