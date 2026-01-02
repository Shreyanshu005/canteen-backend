"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const orderCleanup_service_1 = require("./services/orderCleanup.service");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
// Initialize background jobs
(0, orderCleanup_service_1.initOrderCleanupJob)();
app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map