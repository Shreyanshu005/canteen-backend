"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// All analytics routes require authentication
router.use(auth_middleware_1.protect);
// Analytics routes
router.get('/canteen/:canteenId', analytics_controller_1.getCanteenAnalytics);
router.get('/canteen/:canteenId/earnings', analytics_controller_1.getEarningsBreakdown);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map