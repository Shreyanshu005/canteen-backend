import type { Request, Response } from 'express';
import Canteen from '../models/Canteen';
import redis from '../config/redis';
import { isCanteenOpen } from '../utils/time';

// @desc    Create or Update Canteen
// @route   POST /api/v1/canteens
// @access  Private
export const createOrUpdateCanteen = async (req: Request, res: Response) => {
    try {
        const { id } = req.query;

        if (id) {
            // Update logic
            return updateCanteen(req, res, id as string);
        } else {
            // Create logic
            return createCanteen(req, res);
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const createCanteen = async (req: Request, res: Response) => {
    try {
        const { name, place, ownerId, isOpen, openingTime, closingTime } = req.body;

        const canteen = await Canteen.create({
            name,
            place,
            ownerId,
            isOpen: isOpen !== undefined ? isOpen : true,
            openingTime,
            closingTime
        });

        // Invalidate lists cache
        await redis.del('canteens:all');
        if (ownerId) await redis.del(`canteens:owner:${ownerId}`);

        res.status(201).json({
            success: true,
            data: canteen,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const updateCanteen = async (req: Request, res: Response, id: string) => {
    try {
        const { name, place, ownerId, isOpen, openingTime, closingTime } = req.body;

        let canteen = await Canteen.findById(id);

        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        // Update fields
        canteen.name = name || canteen.name;
        canteen.place = place || canteen.place;
        canteen.ownerId = ownerId || canteen.ownerId;
        if (isOpen !== undefined) canteen.isOpen = isOpen;
        if (openingTime !== undefined) canteen.openingTime = openingTime;
        if (closingTime !== undefined) canteen.closingTime = closingTime;

        await canteen.save();

        // INVALIDATE CACHES
        await redis.del(`canteen:${id}`);
        await redis.del('canteens:all');
        await redis.del(`canteens:owner:${canteen.ownerId}`);
        await redis.del(`menu:${id}`); // Menu depends on canteen status/hours

        res.status(200).json({
            success: true,
            data: {
                ...canteen.toObject(),
                isCurrentlyOpen: isCanteenOpen(canteen)
            },
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Toggle Canteen Status (Open/Close)
// @route   PATCH /api/v1/canteens/:id/status
// @access  Private (Owner/Admin)
export const toggleCanteenStatus = async (req: Request, res: Response) => {
    try {
        const canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        // Check ownership
        if (canteen.ownerId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this canteen' });
        }

        // Toggle status
        canteen.isOpen = !canteen.isOpen;
        await canteen.save();

        // INVALIDATE CACHES
        await redis.del(`canteen:${req.params.id}`);
        await redis.del('canteens:all');
        await redis.del(`canteens:owner:${canteen.ownerId}`);
        await redis.del(`menu:${req.params.id}`);

        res.status(200).json({
            success: true,
            data: {
                ...canteen.toObject(),
                isCurrentlyOpen: isCanteenOpen(canteen)
            },
            message: `Canteen is now ${canteen.isOpen ? 'OPEN' : 'CLOSED'}`
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get All Canteens
// @route   GET /api/v1/canteens
// @access  Private
export const getAllCanteens = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'canteens:all';
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            const canteens = JSON.parse(cachedData);
            // Dynamic status must be re-recalculated because time passes
            const canteensWithStatus = canteens.map((c: any) => ({
                ...c,
                isCurrentlyOpen: isCanteenOpen(c)
            }));
            return res.status(200).json({
                success: true,
                count: canteens.length,
                data: canteensWithStatus,
                fromCache: true
            });
        }

        const canteens = await Canteen.find().populate('ownerId', 'email role');

        await redis.set(cacheKey, JSON.stringify(canteens), 'EX', 3600);

        const canteensWithStatus = canteens.map(canteen => ({
            ...canteen.toObject(),
            isCurrentlyOpen: isCanteenOpen(canteen)
        }));

        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteensWithStatus,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get Single Canteen
// @route   GET /api/v1/canteens/:id
// @access  Private
export const getCanteenById = async (req: Request, res: Response) => {
    try {
        if (req.params.id === 'my-canteens') {
            return getMyCanteens(req, res);
        }

        const cacheKey = `canteen:${req.params.id}`;
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            const canteen = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                data: {
                    ...canteen,
                    isCurrentlyOpen: isCanteenOpen(canteen)
                },
                fromCache: true
            });
        }

        const canteen = await Canteen.findById(req.params.id).populate('ownerId', 'email role');

        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        await redis.set(cacheKey, JSON.stringify(canteen), 'EX', 3600);

        res.status(200).json({
            success: true,
            data: {
                ...canteen.toObject(),
                isCurrentlyOpen: isCanteenOpen(canteen)
            },
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete Canteen
// @route   DELETE /api/v1/canteens/:id
// @access  Private
export const deleteCanteen = async (req: Request, res: Response) => {
    try {
        const canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        const ownerId = canteen.ownerId;
        await canteen.deleteOne();

        // INVALIDATE CACHES
        await redis.del(`canteen:${req.params.id}`);
        await redis.del('canteens:all');
        await redis.del(`canteens:owner:${ownerId}`);
        await redis.del(`menu:${req.params.id}`);

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get My Canteens
// @route   GET /api/v1/canteens/my-canteens
// @access  Private
export const getMyCanteens = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated properly' });
        }

        const cacheKey = `canteens:owner:${userId}`;
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            const canteens = JSON.parse(cachedData);
            const canteensWithStatus = canteens.map((c: any) => ({
                ...c,
                isCurrentlyOpen: isCanteenOpen(c)
            }));
            return res.status(200).json({
                success: true,
                count: canteens.length,
                data: canteensWithStatus,
                fromCache: true
            });
        }

        const canteens = await Canteen.find({ ownerId: userId });

        await redis.set(cacheKey, JSON.stringify(canteens), 'EX', 3600);

        const canteensWithStatus = canteens.map(canteen => ({
            ...canteen.toObject(),
            isCurrentlyOpen: isCanteenOpen(canteen)
        }));

        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteensWithStatus,
        });
    } catch (err: any) {
        console.error('Error in getMyCanteens:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
