"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    menuItemId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});
const OrderSchema = new mongoose_1.Schema({
    orderId: {
        type: String,
        unique: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    canteenId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Canteen',
        required: true,
    },
    items: {
        type: [OrderItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
            message: 'Order must have at least one item',
        },
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentId: {
        type: String,
    },
    qrCode: {
        type: String,
    },
}, {
    timestamps: true,
});
// Generate unique order ID before saving
OrderSchema.pre('save', function () {
    if (!this.orderId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        this.orderId = `ORD-${timestamp}-${random}`.toUpperCase();
    }
});
// Compound indexes for optimized querying
OrderSchema.index({ canteenId: 1, status: 1, createdAt: -1 }); // Canteen Dashboard
OrderSchema.index({ userId: 1, createdAt: -1 }); // User History
OrderSchema.index({ status: 1, createdAt: 1 }); // Background Cleanup Jobs
// Note: orderId index is already created via unique: true in schema definition
exports.default = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map