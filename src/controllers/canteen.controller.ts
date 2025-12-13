import type { Request, Response } from 'express';
import Canteen from '../models/Canteen';

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
        const { name, place, ownerId } = req.body;

        const canteen = await Canteen.create({
            name,
            place,
            ownerId,
        });

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
        const { name, place, ownerId } = req.body;

        let canteen = await Canteen.findById(id);

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
        const canteens = await Canteen.find().populate('ownerId', 'email role');
        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteens,
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
        const canteen = await Canteen.findById(req.params.id).populate('ownerId', 'email role');

        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        res.status(200).json({
            success: true,
            data: canteen,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete Canteen
// @route   DELETE /api/v1/canteens/:id
// @access  Private
// @note    Using POST request in some contexts? No, sticking to DELETE as per updated req.
//          Wait, user req said: postman request DELETE '/api/v1/canteens/...'
export const deleteCanteen = async (req: Request, res: Response) => {
    try {
        const canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        await canteen.deleteOne();

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
        console.log('Fetching canteens for user:', req.user?._id);

        if (!req.user?._id) {
            console.error('User ID not found in req.user');
            return res.status(401).json({ success: false, error: 'User not authenticated properly' });
        }

        // Assuming req.user is populated by auth middleware
        const canteens = await Canteen.find({ ownerId: req.user._id });

        console.log(`Found ${canteens.length} canteens for user ${req.user._id}`);

        res.status(200).json({
            success: true,
            count: canteens.length,
            data: canteens,
        });
    } catch (err: any) {
        console.error('Error in getMyCanteens:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
