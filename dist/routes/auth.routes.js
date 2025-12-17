"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/email/send-otp', auth_controller_1.sendOtp);
router.post('/email/verify-otp', auth_controller_1.verifyOtp);
router.delete('/me', auth_middleware_1.protect, auth_controller_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map