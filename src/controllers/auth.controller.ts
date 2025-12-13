import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

import sendEmail from '../utils/sendEmail';

// @desc    Send OTP to email
// @route   POST /api/v1/auth/email/send-otp
// @access  Public
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide an email' });
        }

        // Check if user exists, if not create one
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                role: 'user', // Default role
            });
        }

        // Generate random 6 digit OTP
        let otp = Math.floor(100000 + Math.random() * 900000).toString();
        let otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // SPECIAL HANDLING: Demo User for App Store Review
        // Allows login without accessing email
        if (email.toLowerCase() === 'demo@canteen.com') {
            console.log('🔹 Demo User Login Detected');
            otp = '123456';
            otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        }

        // Save crypto to database
        console.log('Saving user to DB...');
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        if (email.toLowerCase() === 'demo@canteen.com') {
            console.log(`✅ Demo OTP set to 123456 for ${email}`);
            return res.status(200).json({
                success: true,
                data: 'OTP sent to email',
            });
        }

        console.log('User saved. Sending Email...');
        console.log(`OTP for ${email}: ${otp}`);

        const message = `Your OTP is ${otp} `;

        try {
            console.log('Calling sendEmail...');
            await sendEmail({
                email: user.email,
                subject: 'Canteen App OTP',
                message,
            });
            console.log('Email sent successfully.');

            res.status(200).json({
                success: true,
                data: 'OTP sent to email',
            });
        } catch (err: any) {
            console.error(err);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/email/verify-otp
// @access  Public
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Please provide email and otp' });
        }

        // Find user with matching email and otp, and check expiration
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            token,
            role: user.role,
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
