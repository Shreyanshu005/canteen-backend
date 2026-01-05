"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCanteens = exports.deleteCanteen = exports.getCanteenById = exports.getAllCanteens = exports.toggleCanteenStatus = exports.createOrUpdateCanteen = void 0;
const Canteen_1 = __importDefault(require("../models/Canteen"));
const redis_1 = __importDefault(require("../config/redis"));
const time_1 = require("../utils/time");
// @desc    Create or Update Canteen
// @route   POST /api/v1/canteens
// @access  Private
const createOrUpdateCanteen = async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            // Update logic
            return updateCanteen(req, res, id);
        }
        else {
            // Create logic
            return createCanteen(req, res);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.createOrUpdateCanteen = createOrUpdateCanteen;
const createCanteen = async (req, res) => {
    try {
        const { name, place, ownerId, isOpen, openingTime, closingTime } = req.body;
        const canteen = await Canteen_1.default.create({
            name,
            place,
            ownerId,
            isOpen: isOpen !== undefined ? isOpen : true,
            openingTime,
            closingTime
        });
        // Invalidate lists cache
        await redis_1.default.del('canteens:all');
        if (ownerId)
            await redis_1.default.del(`canteens:owner:${ownerId}`);
        res.status(201).json({
            success: true,
            data: canteen,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
const updateCanteen = async (req, res, id) => {
    try {
        const { name, place, ownerId, isOpen, openingTime, closingTime } = req.body;
        let canteen = await Canteen_1.default.findById(id);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        // Update fields
        canteen.name = name || canteen.name;
        canteen.place = place || canteen.place;
        canteen.ownerId = ownerId || canteen.ownerId;
        if (isOpen !== undefined)
            canteen.isOpen = isOpen;
        if (openingTime !== undefined)
            canteen.openingTime = openingTime;
        if (closingTime !== undefined)
            canteen.closingTime = closingTime;
        await canteen.save();
        // INVALIDATE CACHES
        await redis_1.default.del(`canteen:${id}`);
        await redis_1.default.del('canteens:all');
        await redis_1.default.del(`canteens:owner:${canteen.ownerId}`);
        await redis_1.default.del(`menu:${id}`); // Menu depends on canteen status/hours
        res.status(200).json({
            success: true,
            data: {
                ...canteen.toObject(),
                isCurrentlyOpen: (0, time_1.isCanteenOpen)(canteen)
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
// @desc    Toggle Canteen Status (Open/Close)
// @route   PATCH /api/v1/canteens/:id/status
// @access  Private (Owner/Admin)
const toggleCanteenStatus = async (req, res) => {
    try {
        const canteen = await Canteen_1.default.findById(req.params.id);
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
        await redis_1.default.del(`canteen:${req.params.id}`);
        await redis_1.default.del('canteens:all');
        await redis_1.default.del(`canteens:owner:${canteen.ownerId}`);
        await redis_1.default.del(`menu:${req.params.id}`);
        res.status(200).json({
            success: true,
            data: {
                ...canteen.toObject(),
                isCurrentlyOpen: (0, time_1.isCanteenOpen)(canteen)
            },
            message: `Canteen is now ${canteen.isOpen ? 'OPEN' : 'CLOSED'}`
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.toggleCanteenStatus = toggleCanteenStatus;
// @desc    Get All Canteens
// @route   GET /api/v1/canteens
// @access  Private
const getAllCanteens = async (req, res) => {
    try {
        const cacheKey = 'canteens:all';
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            const canteens = JSON.parse(cachedData);
            // Dynamic status must be re-recalculated because time passes
            const canteensWithStatus = canteens.map((c) => ({
                ...c,
                isCurrentlyOpen: (0, time_1.isCanteenOpen)(c)
            }));
            return res.status(200).json({
                success: true,
                count: canteens.length,
                data: canteensWithStatus,
                fromCache: true
            });
        }
        const canteens = await Canteen_1.default.find().populate('ownerId', 'email role');
        await redis_1.default.set(cacheKey, JSON.stringify(canteens), 'EX', 3600);
        const canteensWithStatus = canteens.map(canteen => ({
            ...canteen.toObject(),
            isCurrentlyOpen: (0, time_1.isCanteenOpen)(canteen)
        }));
        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteensWithStatus,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getAllCanteens = getAllCanteens;
// @desc    Get Single Canteen
// @route   GET /api/v1/canteens/:id
// @access  Private
const getCanteenById = async (req, res) => {
    try {
        if (req.params.id === 'my-canteens') {
            return (0, exports.getMyCanteens)(req, res);
        }
        const cacheKey = `canteen:${req.params.id}`;
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            const canteen = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                data: {
                    ...canteen,
                    isCurrentlyOpen: (0, time_1.isCanteenOpen)(canteen)
                },
                fromCache: true
            });
        }
        const canteen = await Canteen_1.default.findById(req.params.id).populate('ownerId', 'email role');
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        await redis_1.default.set(cacheKey, JSON.stringify(canteen), 'EX', 3600);
        res.status(200).json({
            success: true,
            data: {
                ...canteen.toObject(),
                isCurrentlyOpen: (0, time_1.isCanteenOpen)(canteen)
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getCanteenById = getCanteenById;
// @desc    Delete Canteen
// @route   DELETE /api/v1/canteens/:id
// @access  Private
const deleteCanteen = async (req, res) => {
    try {
        const canteen = await Canteen_1.default.findById(req.params.id);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        const ownerId = canteen.ownerId;
        await canteen.deleteOne();
        // INVALIDATE CACHES
        await redis_1.default.del(`canteen:${req.params.id}`);
        await redis_1.default.del('canteens:all');
        await redis_1.default.del(`canteens:owner:${ownerId}`);
        await redis_1.default.del(`menu:${req.params.id}`);
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
exports.deleteCanteen = deleteCanteen;
// @desc    Get My Canteens
// @route   GET /api/v1/canteens/my-canteens
// @access  Private
const getMyCanteens = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated properly' });
        }
        const cacheKey = `canteens:owner:${userId}`;
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            const canteens = JSON.parse(cachedData);
            const canteensWithStatus = canteens.map((c) => ({
                ...c,
                isCurrentlyOpen: (0, time_1.isCanteenOpen)(c)
            }));
            return res.status(200).json({
                success: true,
                count: canteens.length,
                data: canteensWithStatus,
                fromCache: true
            });
        }
        const canteens = await Canteen_1.default.find({ ownerId: userId });
        await redis_1.default.set(cacheKey, JSON.stringify(canteens), 'EX', 3600);
        const canteensWithStatus = canteens.map(canteen => ({
            ...canteen.toObject(),
            isCurrentlyOpen: (0, time_1.isCanteenOpen)(canteen)
        }));
        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteensWithStatus,
        });
    }
    catch (err) {
        console.error('Error in getMyCanteens:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getMyCanteens = getMyCanteens;
//# sourceMappingURL=canteen.controller.js.map