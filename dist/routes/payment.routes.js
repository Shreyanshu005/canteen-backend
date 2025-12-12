"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Protected routes
router.post('/initiate', auth_middleware_1.protect, payment_controller_1.initiatePayment);
router.post('/verify', auth_middleware_1.protect, payment_controller_1.verifyPayment);
// Webhook route (public but verified internally)
router.post('/webhook', payment_controller_1.handleWebhook);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map