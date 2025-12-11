"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const canteen_controller_1 = require("../controllers/canteen.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply auth middleware to all routes
router.use(auth_middleware_1.protect);
router.post('/', canteen_controller_1.createOrUpdateCanteen); // Handling create and update via query param
router.get('/', canteen_controller_1.getAllCanteens);
router.get('/my-canteens', canteen_controller_1.getMyCanteens); // Must be before /:id
router.get('/:id', canteen_controller_1.getCanteenById);
router.delete('/:id', canteen_controller_1.deleteCanteen);
exports.default = router;
//# sourceMappingURL=canteen.routes.js.map