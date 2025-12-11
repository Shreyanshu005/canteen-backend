"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCanteens = exports.deleteCanteen = exports.getCanteenById = exports.getAllCanteens = exports.createOrUpdateCanteen = void 0;
const Canteen_1 = __importDefault(require("../models/Canteen"));
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
        const { name, place, ownerId } = req.body;
        const canteen = await Canteen_1.default.create({
            name,
            place,
            ownerId,
        });
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
        const { name, place, ownerId } = req.body;
        let canteen = await Canteen_1.default.findById(id);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        // Update fields
        canteen.name = name || canteen.name;
        canteen.place = place || canteen.place;
        canteen.ownerId = ownerId || canteen.ownerId; // Assuming admin can change owner
        await canteen.save();
        res.status(200).json({
            success: true,
            data: canteen,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
// @desc    Get All Canteens
// @route   GET /api/v1/canteens
// @access  Private
const getAllCanteens = async (req, res) => {
    try {
        const canteens = await Canteen_1.default.find().populate('ownerId', 'email role');
        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteens,
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
        const canteen = await Canteen_1.default.findById(req.params.id).populate('ownerId', 'email role');
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        res.status(200).json({
            success: true,
            data: canteen,
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
// @note    Using POST request in some contexts? No, sticking to DELETE as per updated req.
//          Wait, user req said: postman request DELETE '/api/v1/canteens/...'
const deleteCanteen = async (req, res) => {
    try {
        const canteen = await Canteen_1.default.findById(req.params.id);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }
        await canteen.deleteOne();
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
        // Assuming req.user is populated by auth middleware
        const canteens = await Canteen_1.default.find({ ownerId: req.user?._id });
        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteens,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.getMyCanteens = getMyCanteens;
//# sourceMappingURL=canteen.controller.js.map