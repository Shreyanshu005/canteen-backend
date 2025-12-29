"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
// Load env vars
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express_1.default.urlencoded({ extended: true })); // For x-www-form-urlencoded
app.use((0, cors_1.default)());
// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
const payment_controller_1 = require("./controllers/payment.controller");
// Basic route for testing
app.get('/', (req, res) => {
    res.send('Canteen Backend API is running');
});
// Safety Fallback: Razorpay often hits the root / instead of the specific path
app.post('/', payment_controller_1.handleWebhook);
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const canteen_routes_1 = __importDefault(require("./routes/canteen.routes"));
const menu_routes_1 = __importDefault(require("./routes/menu.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/canteens', canteen_routes_1.default);
app.use('/api/v1/menu', menu_routes_1.default);
app.use('/api/v1/orders', order_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Server Error' });
});
exports.default = app;
//# sourceMappingURL=app.js.map