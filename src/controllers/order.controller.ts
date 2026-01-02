import type { Request, Response } from 'express';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import Canteen from '../models/Canteen';
import { generateOrderQR, verifyOrderQR as verifyQRCode } from '../utils/qrGenerator';

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
    const reservedItems: { id: string; quantity: number }[] = [];
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
        const canteen = await Canteen.findById(canteenId);
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
            const menuItem = await MenuItem.findOneAndUpdate(
                {
                    _id: menuItemId,
                    canteenId: canteenId, // Ensure item belongs to this canteen
                    availableQuantity: { $gte: quantity } // Ensure enough stock
                },
                { $inc: { availableQuantity: -quantity } },
                { new: true }
            );

            if (!menuItem) {
                // If null, it means either:
                // 1. Item doesn't exist
                // 2. Item not in this canteen
                // 3. Insufficient quantity
                // We'll try to find the item normally to give a specific error message
                const checkItem = await MenuItem.findById(menuItemId);
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
        const order = await Order.create({
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
    } catch (err: any) {
        console.error('Order Creation Error:', err.message);

        // ROLLBACK: release reserved inventory
        if (reservedItems.length > 0) {
            console.log('Rolling back reserved inventory items...');
            for (const item of reservedItems) {
                await MenuItem.findByIdAndUpdate(item.id, {
                    $inc: { availableQuantity: item.quantity }
                });
            }
        }

        const statusCode = err.message.includes('found') || err.message.includes('Insufficient') ? 400 : 500;
        res.status(statusCode).json({ success: false, error: err.message || 'Server Error' });
    }
};

// @desc    Get my orders
// @route   GET /api/v1/orders
// @access  Private
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { status } = req.query;

        const filter: any = { userId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('canteenId', 'name place')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let order;

        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(id)
                .populate('canteenId', 'name place')
                .populate('userId', 'email');
        } else {
            order = await Order.findOne({ orderId: id })
                .populate('canteenId', 'name place')
                .populate('userId', 'email');
        }

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check if user owns this order or is admin/canteen owner
        const isOwner = order.userId._id.toString() === req.user?._id.toString();
        const isAdmin = req.user?.role === 'admin';
        const canteen = await Canteen.findById(order.canteenId);
        const isCanteenOwner = canteen?.ownerId.toString() === req.user?._id.toString();

        if (!isOwner && !isAdmin && !isCanteenOwner) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update order status
// @route   PATCH /api/v1/orders/:id/status
// @access  Private (Admin/Canteen Owner)
export const updateOrderStatus = async (req: Request, res: Response) => {
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
            order = await Order.findById(id);
        } else {
            order = await Order.findOne({ orderId: id });
        }

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check authorization
        const canteen = await Canteen.findById(order.canteenId);
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Cancel order
// @route   DELETE /api/v1/orders/:id
// @access  Private
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let order;

        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(id);
        } else {
            order = await Order.findOne({ orderId: id });
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
            await MenuItem.findByIdAndUpdate(item.menuItemId, {
                $inc: { availableQuantity: item.quantity }
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get canteen orders
// @route   GET /api/v1/orders/canteen/:canteenId
// @access  Private (Admin/Canteen Owner)
export const getCanteenOrders = async (req: Request, res: Response) => {
    try {
        const { canteenId } = req.params;
        const { status } = req.query;

        const canteen = await Canteen.findById(canteenId);
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

        const filter: any = { canteenId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('userId', 'email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Verify order QR code
// @route   POST /api/v1/orders/verify-qr
// @access  Private (Admin/Canteen Owner)
export const verifyOrderQR = async (req: Request, res: Response) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({ success: false, error: 'QR data is required' });
        }

        // Verify QR code
        const verified = verifyQRCode(qrData);
        if (!verified) {
            return res.status(400).json({ success: false, error: 'Invalid or expired QR code' });
        }

        const { orderId } = verified;

        // Find order by orderId (not _id)
        const order = await Order.findOne({ orderId })
            .populate('canteenId', 'name place ownerId')
            .populate('userId', 'email');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check authorization
        const canteen = order.canteenId as any;
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Complete order pickup using QR code
// @route   POST /api/v1/orders/pickup
// @access  Private (Admin/Canteen Owner)
export const completeOrderPickup = async (req: Request, res: Response) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({ success: false, error: 'QR data is required' });
        }

        // Verify QR code
        const verified = verifyQRCode(qrData);
        if (!verified) {
            return res.status(400).json({ success: false, error: 'Invalid or expired QR code' });
        }

        const { orderId } = verified;

        // Find order and populate canteen with ownerId
        const order = await Order.findOne({ orderId })
            .populate('canteenId', 'name place ownerId');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check authorization
        const canteen = order.canteenId as any;
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
