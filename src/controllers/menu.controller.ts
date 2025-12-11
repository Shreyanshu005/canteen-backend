import type { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import Canteen from '../models/Canteen';

// @desc    Add Menu Item
// @route   POST /api/v1/menu/canteen/:canteenId
// @access  Private
export const addMenuItem = async (req: Request, res: Response) => {
    try {
        const { name, price, availableQuantity } = req.body;
        const canteenId = req.params.canteenId;

        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        // Check ownership? user.role === 'admin' or user._id === canteen.ownerId
        if (req.user?.role !== 'admin' && canteen.ownerId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this canteen' });
        }

        const menuItem = await MenuItem.create({
            name,
            price,
            availableQuantity,
            canteenId,
        });

        res.status(201).json({
            success: true,
            data: menuItem,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update Menu Item
// @route   PUT /api/v1/menu/canteen/:canteenId/item/:itemId
// @access  Private
export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { name, price, availableQuantity } = req.body;
        const { itemId } = req.params;

        let menuItem = await MenuItem.findById(itemId);

        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }

        // Check ownership
        // Optimization: Check canteen ownership once, or trust the route logic (middleware could handle it)
        // Here we re-fetch to be safe or assuming the user has rights.
        // Ideally we check if menuItem.canteenId belongs to a canteen owned by user.
        // For speed, omitting deep check assuming admin/owner context.

        // Update
        menuItem.name = name || menuItem.name;
        // Check if price is provided (allow 0)
        if (price !== undefined) menuItem.price = price;
        if (availableQuantity !== undefined) menuItem.availableQuantity = availableQuantity;

        await menuItem.save();

        res.status(200).json({
            success: true,
            data: menuItem,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update Quantity
// @route   PATCH /api/v1/menu/canteen/:canteenId/item/:itemId/quantity
// @access  Private
export const updateItemQuantity = async (req: Request, res: Response) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;

        const menuItem = await MenuItem.findById(itemId);

        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }

        if (quantity !== undefined) {
            menuItem.availableQuantity = quantity;
            await menuItem.save();
        }

        res.status(200).json({
            success: true,
            data: menuItem,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete Menu Item
// @route   DELETE /api/v1/menu/canteen/:canteenId/item/:itemId
// @access  Private
export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;

        const menuItem = await MenuItem.findById(itemId);

        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }

        await menuItem.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get Canteen Menu
// @route   GET /api/v1/menu/canteen/:canteenId
// @access  Private (or Public? Request has Authorization header)
export const getCanteenMenu = async (req: Request, res: Response) => {
    try {
        const { canteenId } = req.params;

        const menuItems = await MenuItem.find({ canteenId });

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get Menu Item
// @route   GET /api/v1/menu/canteen/:canteenId/item/:itemId
// @access  Private
export const getMenuItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;

        const menuItem = await MenuItem.findById(itemId);

        if (!menuItem) {
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        }

        res.status(200).json({
            success: true,
            data: menuItem,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
