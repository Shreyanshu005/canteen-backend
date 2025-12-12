"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_controller_1 = require("../controllers/menu.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.get('/canteen/:canteenId', menu_controller_1.getCanteenMenu);
router.get('/canteen/:canteenId/item/:itemId', menu_controller_1.getMenuItem);
// Protected routes (authentication required)
router.post('/canteen/:canteenId', auth_middleware_1.protect, menu_controller_1.addMenuItem);
router.put('/canteen/:canteenId/item/:itemId', auth_middleware_1.protect, menu_controller_1.updateMenuItem);
router.patch('/canteen/:canteenId/item/:itemId/quantity', auth_middleware_1.protect, menu_controller_1.updateItemQuantity);
router.delete('/canteen/:canteenId/item/:itemId', auth_middleware_1.protect, menu_controller_1.deleteMenuItem);
exports.default = router;
//# sourceMappingURL=menu.routes.js.map