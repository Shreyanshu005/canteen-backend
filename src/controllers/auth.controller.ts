import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';


import sendEmail from '../utils/sendEmail';
import { getOTPEmailTemplate } from '../utils/emailTemplates';
import { setOTP, getOTP, deleteOTP } from '../config/redis';

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
        let expirySeconds = 600; // 10 minutes

        // SPECIAL HANDLING: Demo User for App Store Review
        if (email.toLowerCase() === 'demo@canteen.com') {
            otp = '123456';
            expirySeconds = 24 * 60 * 60; // 24 hours
        }

        // Save OTP to Redis
        console.log(`Saving verification code to Redis for ${email}...`);
        await setOTP(email, otp, expirySeconds);

        if (email.toLowerCase() === 'demo@canteen.com') {
            console.log(`✅ Demo OTP set to 123456 for ${email}`);
            return res.status(200).json({
                success: true,
                data: 'OTP sent to email',
            });
        }

        console.log('User saved. Sending Email...');
        console.log(`OTP for ${email}: ${otp}`);

        const message = `Your BunkBite verification code is ${otp}`;
        const htmlContent = getOTPEmailTemplate(otp);

        try {
            console.log('Calling sendEmail...');
            await sendEmail({
                email: user.email,
                subject: 'Your BunkBite Verification Code',
                message,
                html: htmlContent,
            });
            console.log('Email sent successfully.');

            res.status(200).json({
                success: true,
                data: 'OTP sent to email',
            });
        } catch (err: any) {
            console.error(err);
            await deleteOTP(email);
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

        // Find user
        const user = await User.findOne({ email });

        // Get OTP from Redis
        const storedOtp = await getOTP(email);

        if (!user || !storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Clear OTP from Redis
        await deleteOTP(email);

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: (process.env.JWT_EXPIRE || '30d') as any }
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
// @desc    Delete user account
// @route   DELETE /api/v1/auth/me
// @access  Private
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Safe to delete
        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Account deleted successfully'
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
