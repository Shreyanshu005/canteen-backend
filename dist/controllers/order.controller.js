"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOrderPickup = exports.verifyOrderQR = exports.getCanteenOrders = exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
const Canteen_1 = __importDefault(require("../models/Canteen"));
const qrGenerator_1 = require("../utils/qrGenerator");
// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { canteenId, items } = req.body;
        const userId = req.user?._id;
        if (!canteenId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide canteenId and items array',
            });
        }
        // Verify canteen exists
        const canteen = await Canteen_1.default.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        // Validate and fetch menu items
        const orderItems = [];
        let totalAmount = 0;
        for (const item of items) {
            const { menuItemId, quantity } = item;
            if (!menuItemId || !quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid item format. Provide menuItemId and quantity',
                });
            }
            const menuItem = await MenuItem_1.default.findById(menuItemId);
            if (!menuItem) {
                return res.status(404).json({
                    success: false,
                    error: `Menu item ${menuItemId} not found`,
                });
            }
            // Check if item belongs to the canteen
            if (menuItem.canteenId.toString() !== canteenId) {
                return res.status(400).json({
                    success: false,
                    error: `Item ${menuItem.name} does not belong to this canteen`,
                });
            }
            // Check availability
            if (menuItem.availableQuantity < quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient quantity for ${menuItem.name}. Available: ${menuItem.availableQuantity}`,
                });
            }
            orderItems.push({
                menuItemId: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity,
            });
            totalAmount += menuItem.price * quantity;
        }
        // Create order
        const order = await Order_1.default.create({
            userId,
            canteenId,
            items: orderItems,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
        });
        res.status(201).json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.createOrder = createOrder;
// @desc    Get my orders
// @route   GET /api/v1/orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { status } = req.query;
        const filter = { userId };
        if (status) {
            filter.status = status;
        }
        const orders = await Order_1.default.find(filter)
            .populate('canteenId', 'name place')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getMyOrders = getMyOrders;
// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
            .populate('canteenId', 'name place')
            .populate('userId', 'email');
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check if user owns this order or is admin/canteen owner
        const isOwner = order.userId._id.toString() === req.user?._id.toString();
        const isAdmin = req.user?.role === 'admin';
        const canteen = await Canteen_1.default.findById(order.canteenId);
        const isCanteenOwner = canteen?.ownerId.toString() === req.user?._id.toString();
        if (!isOwner && !isAdmin && !isCanteenOwner) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getOrderById = getOrderById;
// @desc    Update order status
// @route   PATCH /api/v1/orders/:id/status
// @access  Private (Admin/Canteen Owner)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['preparing', 'ready', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check authorization
        const canteen = await Canteen_1.default.findById(order.canteenId);
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen?.ownerId.toString() === req.user?._id.toString();
        if (!isAdmin && !isCanteenOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this order',
            });
        }
        // Validate status transition
        if (order.paymentStatus !== 'success' && status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update status for unpaid orders',
            });
        }
        order.status = status;
        await order.save();
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// @desc    Cancel order
// @route   DELETE /api/v1/orders/:id
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check if user owns this order
        if (order.userId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to cancel this order' });
        }
        // Can only cancel pending or paid orders (not preparing/ready/completed)
        if (!['pending', 'paid'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel order in current status',
            });
        }
        order.status = 'cancelled';
        await order.save();
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.cancelOrder = cancelOrder;
// @desc    Get canteen orders
// @route   GET /api/v1/orders/canteen/:canteenId
// @access  Private (Admin/Canteen Owner)
const getCanteenOrders = async (req, res) => {
    try {
        const { canteenId } = req.params;
        const { status } = req.query;
        const canteen = await Canteen_1.default.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        // Check authorization
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen.ownerId.toString() === req.user?._id.toString();
        if (!isAdmin && !isCanteenOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these orders',
            });
        }
        const filter = { canteenId };
        if (status) {
            filter.status = status;
        }
        const orders = await Order_1.default.find(filter)
            .populate('userId', 'email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getCanteenOrders = getCanteenOrders;
// @desc    Verify order QR code
// @route   POST /api/v1/orders/verify-qr
// @access  Private (Admin/Canteen Owner)
const verifyOrderQR = async (req, res) => {
    try {
        const { qrData } = req.body;
        if (!qrData) {
            return res.status(400).json({ success: false, error: 'QR data is required' });
        }
        // Verify QR code
        const verified = (0, qrGenerator_1.verifyOrderQR)(qrData);
        if (!verified) {
            return res.status(400).json({ success: false, error: 'Invalid or expired QR code' });
        }
        const { orderId } = verified;
        // Find order by orderId (not _id)
        const order = await Order_1.default.findOne({ orderId })
            .populate('canteenId', 'name place')
            .populate('userId', 'email');
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check authorization
        const canteen = await Canteen_1.default.findById(order.canteenId);
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen?.ownerId.toString() === req.user?._id.toString();
        if (!isAdmin && !isCanteenOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to verify orders for this canteen',
            });
        }
        res.status(200).json({
            success: true,
            data: order,
            message: 'QR code verified successfully',
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.verifyOrderQR = verifyOrderQR;
// @desc    Complete order pickup using QR code
// @route   POST /api/v1/orders/pickup
// @access  Private (Admin/Canteen Owner)
const completeOrderPickup = async (req, res) => {
    try {
        const { qrData } = req.body;
        if (!qrData) {
            return res.status(400).json({ success: false, error: 'QR data is required' });
        }
        // Verify QR code
        const verified = (0, qrGenerator_1.verifyOrderQR)(qrData);
        if (!verified) {
            return res.status(400).json({ success: false, error: 'Invalid or expired QR code' });
        }
        const { orderId } = verified;
        // Find order
        const order = await Order_1.default.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check authorization
        const canteen = await Canteen_1.default.findById(order.canteenId);
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen?.ownerId.toString() === req.user?._id.toString();
        if (!isAdmin && !isCanteenOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to complete orders for this canteen',
            });
        }
        // Check if order is already completed or cancelled
        if (order.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Order already picked up/completed',
                data: order
            });
        }
        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Order is cancelled',
                data: order
            });
        }
        if (order.paymentStatus !== 'success') {
            return res.status(400).json({
                success: false,
                error: 'Payment not completed for this order',
                data: order
            });
        }
        // Update status to completed
        order.status = 'completed';
        await order.save();
        res.status(200).json({
            success: true,
            message: 'Order pickup completed successfully',
            data: order,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.completeOrderPickup = completeOrderPickup;
//# sourceMappingURL=order.controller.js.map