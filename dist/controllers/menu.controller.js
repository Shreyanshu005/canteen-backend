"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuItem = exports.getCanteenMenu = exports.deleteMenuItem = exports.updateItemQuantity = exports.updateMenuItem = exports.addMenuItem = void 0;
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
const Canteen_1 = __importDefault(require("../models/Canteen"));
const redis_1 = __importDefault(require("../config/redis"));
// @desc    Add Menu Item
// @route   POST /api/v1/menu/canteen/:canteenId
// @access  Private
const addMenuItem = async (req, res) => {
    try {
        const { name, price, availableQuantity } = req.body;
        const canteenId = req.params.canteenId;
        const canteen = await Canteen_1.default.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        // Check ownership? user.role === 'admin' or user._id === canteen.ownerId
        if (req.user?.role !== 'admin' && canteen.ownerId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this canteen' });
        }
        const menuItem = await MenuItem_1.default.create({
            name,
            price,
            availableQuantity,
            canteenId,
        });
        // INVALIDATE CACHE
        await redis_1.default.del(`menu:${canteenId}`);
        res.status(201).json({
            success: true,
            data: menuItem,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.addMenuItem = addMenuItem;
// @desc    Update Menu Item
// @route   PUT /api/v1/menu/canteen/:canteenId/item/:itemId
// @access  Private
const updateMenuItem = async (req, res) => {
    try {
        const { name, price, availableQuantity } = req.body;
        const { itemId } = req.params;
        let menuItem = await MenuItem_1.default.findById(itemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }
        // Update
        menuItem.name = name || menuItem.name;
        // Check if price is provided (allow 0)
        if (price !== undefined)
            menuItem.price = price;
        if (availableQuantity !== undefined)
            menuItem.availableQuantity = availableQuantity;
        await menuItem.save();
        // INVALIDATE CACHE
        await redis_1.default.del(`menu:${menuItem.canteenId}`);
        res.status(200).json({
            success: true,
            data: menuItem,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.updateMenuItem = updateMenuItem;
// @desc    Update Quantity
// @route   PATCH /api/v1/menu/canteen/:canteenId/item/:itemId/quantity
// @access  Private
const updateItemQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;
        const menuItem = await MenuItem_1.default.findById(itemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }
        if (quantity !== undefined) {
            menuItem.availableQuantity = quantity;
            await menuItem.save();
            // INVALIDATE CACHE
            await redis_1.default.del(`menu:${menuItem.canteenId}`);
        }
        res.status(200).json({
            success: true,
            data: menuItem,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.updateItemQuantity = updateItemQuantity;
// @desc    Delete Menu Item
// @route   DELETE /api/v1/menu/canteen/:canteenId/item/:itemId
// @access  Private
const deleteMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const menuItem = await MenuItem_1.default.findById(itemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }
        const canteenId = menuItem.canteenId;
        await menuItem.deleteOne();
        // INVALIDATE CACHE
        await redis_1.default.del(`menu:${canteenId}`);
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.deleteMenuItem = deleteMenuItem;
// @desc    Get Canteen Menu
// @route   GET /api/v1/menu/canteen/:canteenId
// @access  Private (or Public? Request has Authorization header)
const getCanteenMenu = async (req, res) => {
    try {
        const { canteenId } = req.params;
        // CHECK CACHE
        const cacheKey = `menu:${canteenId}`;
        const cachedMenu = await redis_1.default.get(cacheKey);
        if (cachedMenu) {
            // Return cached data
            return res.status(200).json(JSON.parse(cachedMenu));
        }
        const menuItems = await MenuItem_1.default.find({ canteenId });
        const responseData = {
            success: true,
            count: menuItems.length,
            data: menuItems,
        };
        // SET CACHE (Expire in 1 hour)
        await redis_1.default.set(cacheKey, JSON.stringify(responseData), 'EX', 3600);
        res.status(200).json(responseData);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getCanteenMenu = getCanteenMenu;
// @desc    Get Menu Item
// @route   GET /api/v1/menu/canteen/:canteenId/item/:itemId
// @access  Private
const getMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const menuItem = await MenuItem_1.default.findById(itemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }
        res.status(200).json({
            success: true,
            data: menuItem,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getMenuItem = getMenuItem;
//# sourceMappingURL=menu.controller.js.map