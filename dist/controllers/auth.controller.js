"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.verifyOtp = exports.sendOtp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const emailTemplates_1 = require("../utils/emailTemplates");
const redis_1 = require("../config/redis");
// @desc    Send OTP to email
// @route   POST /api/v1/auth/email/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide an email' });
        }
        // Check if user exists, if not create one
        let user = await User_1.default.findOne({ email });
        if (!user) {
            user = await User_1.default.create({
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
        await (0, redis_1.setOTP)(email, otp, expirySeconds);
        if (email.toLowerCase() === 'demo@canteen.com') {
            console.log(`✅ Demo OTP set to 123456 for ${email}`);
            return res.status(200).json({
                success: true,
                data: 'OTP sent to email',
            });
        }
        console.log('User saved. Sending Email...');
        console.log(`OTP for ${email}: ${otp}`);
        const message = `Your OTP is ${otp}`;
        const htmlContent = (0, emailTemplates_1.getOTPEmailTemplate)(otp);
        try {
            console.log('Calling sendEmail...');
            await (0, sendEmail_1.default)({
                email: user.email,
                subject: '🔐 Your Canteen App Verification Code',
                message,
                html: htmlContent,
            });
            console.log('Email sent successfully.');
            res.status(200).json({
                success: true,
                data: 'OTP sent to email',
            });
        }
        catch (err) {
            console.error(err);
            await (0, redis_1.deleteOTP)(email);
            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.sendOtp = sendOtp;
// @desc    Verify OTP
// @route   POST /api/v1/auth/email/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Please provide email and otp' });
        }
        // Find user
        const user = await User_1.default.findOne({ email });
        // Get OTP from Redis
        const storedOtp = await (0, redis_1.getOTP)(email);
        if (!user || !storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }
        // Clear OTP from Redis
        await (0, redis_1.deleteOTP)(email);
        // Create token
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: (process.env.JWT_EXPIRE || '30d') });
        res.status(200).json({
            success: true,
            token,
            role: user.role,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.verifyOtp = verifyOtp;
// @desc    Delete user account
// @route   DELETE /api/v1/auth/me
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }
        const user = await User_1.default.findById(userId);
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=auth.controller.js.map