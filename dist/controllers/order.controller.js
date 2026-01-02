"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOrderPickup = exports.verifyOrderQR = exports.getCanteenOrders = exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
const Canteen_1 = __importDefault(require("../models/Canteen"));
const redis_1 = __importDefault(require("../config/redis"));
const qrGenerator_1 = require("../utils/qrGenerator");
// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = async (req, res) => {
    const reservedItems = [];
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
        // Check if canteen is open (Manual)
        if (canteen.isOpen === false) {
            return res.status(400).json({ success: false, error: 'Canteen is currently closed (Manually Closed)' });
        }
        // Check operating hours (Automatic)
        if (canteen.openingTime && canteen.closingTime) {
            const now = new Date();
            const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const currentHours = istTime.getHours();
            const currentMinutes = istTime.getMinutes();
            const currentTimeValue = currentHours * 60 + currentMinutes;
            const [openH = 0, openM = 0] = canteen.openingTime.split(':').map(Number);
            const openTimeValue = openH * 60 + openM;
            const [closeH = 0, closeM = 0] = canteen.closingTime.split(':').map(Number);
            const closeTimeValue = closeH * 60 + closeM;
            if (currentTimeValue < openTimeValue || currentTimeValue > closeTimeValue) {
                return res.status(400).json({
                    success: false,
                    error: `Canteen is closed. Operating hours: ${canteen.openingTime} - ${canteen.closingTime}`
                });
            }
        }
        // Validate and fetch menu items with ATOMIC inventory deduction
        const orderItems = [];
        let totalAmount = 0;
        for (const item of items) {
            const { menuItemId, quantity } = item;
            if (!menuItemId || !quantity || quantity < 1) {
                throw new Error('Invalid item format. Provide menuItemId and quantity');
            }
            // ATOMICALLY check and deduct quantity
            // This prevents race conditions where two users buy the last item simultaneously
            const menuItem = await MenuItem_1.default.findOneAndUpdate({
                _id: menuItemId,
                canteenId: canteenId, // Ensure item belongs to this canteen
                availableQuantity: { $gte: quantity } // Ensure enough stock
            }, { $inc: { availableQuantity: -quantity } }, { new: true });
            if (!menuItem) {
                // If null, it means either:
                // 1. Item doesn't exist
                // 2. Item not in this canteen
                // 3. Insufficient quantity
                // We'll try to find the item normally to give a specific error message
                const checkItem = await MenuItem_1.default.findById(menuItemId);
                if (!checkItem) {
                    throw new Error(`Menu item ${menuItemId} not found`);
                }
                if (checkItem.canteenId.toString() !== canteenId) {
                    throw new Error(`Item ${checkItem.name} does not belong to this canteen`);
                }
                if (checkItem.availableQuantity < quantity) {
                    throw new Error(`Insufficient quantity for ${checkItem.name}. Available: ${checkItem.availableQuantity}`);
                }
                throw new Error(`Could not add item ${menuItemId}`);
            }
            // Keep track of reserved items for rollback in case of error later
            reservedItems.push({ id: menuItemId, quantity });
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
        // INVALIDATE MENU CACHE (Inventory Changed)
        try {
            await redis_1.default.del(`menu:${canteenId}`);
        }
        catch (e) {
            console.error('Failed to invalidate menu cache', e);
        }
        res.status(201).json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        console.error('Order Creation Error:', err.message);
        // ROLLBACK: release reserved inventory
        if (reservedItems.length > 0) {
            console.log('Rolling back reserved inventory items...');
            for (const item of reservedItems) {
                await MenuItem_1.default.findByIdAndUpdate(item.id, {
                    $inc: { availableQuantity: item.quantity }
                });
            }
        }
        const statusCode = err.message.includes('found') || err.message.includes('Insufficient') ? 400 : 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Server Error' });
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
        const { id } = req.params;
        let order;
        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order_1.default.findById(id)
                .populate('canteenId', 'name place')
                .populate('userId', 'email');
        }
        else {
            order = await Order_1.default.findOne({ orderId: id })
                .populate('canteenId', 'name place')
                .populate('userId', 'email');
        }
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
        const { id } = req.params;
        let order;
        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order_1.default.findById(id);
        }
        else {
            order = await Order_1.default.findOne({ orderId: id });
        }
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
        const { id } = req.params;
        let order;
        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order_1.default.findById(id);
        }
        else {
            order = await Order_1.default.findOne({ orderId: id });
        }
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
        // Release inventory back to the menu items
        for (const item of order.items) {
            await MenuItem_1.default.findByIdAndUpdate(item.menuItemId, {
                $inc: { availableQuantity: item.quantity }
            });
        }
        // INVALIDATE MENU CACHE
        try {
            await redis_1.default.del(`menu:${order.canteenId}`);
        }
        catch (e) {
            console.error('Failed to invalidate menu cache', e);
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
            .populate('canteenId', 'name place ownerId')
            .populate('userId', 'email');
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check authorization
        const canteen = order.canteenId;
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen?.ownerId?.toString() === req.user?._id.toString();
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
        // Find order and populate canteen with ownerId
        const order = await Order_1.default.findOne({ orderId })
            .populate('canteenId', 'name place ownerId');
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check authorization
        const canteen = order.canteenId;
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen?.ownerId?.toString() === req.user?._id.toString();
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