"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // Define email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'BunkBite'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message,
    };
    console.log('Transporter ready. Sending mail...');
    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Transporter sendMail completed.');
};
exports.default = sendEmail;
//# sourceMappingURL=sendEmail.js.map