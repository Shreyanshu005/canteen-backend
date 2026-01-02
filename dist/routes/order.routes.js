"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.protect);
// Order routes
router.post('/', order_controller_1.createOrder);
router.get('/', order_controller_1.getMyOrders);
router.get('/canteen/:canteenId', order_controller_1.getCanteenOrders);
router.get('/:id', order_controller_1.getOrderById);
router.patch('/:id/status', order_controller_1.updateOrderStatus);
// router.delete('/:id', cancelOrder); // Manual cancellation disabled
// QR verification and pickup
router.post('/verify-qr', order_controller_1.verifyOrderQR);
router.post('/pickup', order_controller_1.completeOrderPickup);
exports.default = router;
//# sourceMappingURL=order.routes.js.map