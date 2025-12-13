"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOTPEmailTemplate = void 0;
const getOTPEmailTemplate = (otp) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px;">
    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.3);">
                    <span style="font-size: 40px;">🍽️</span>
                </div>
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Canteen App</h1>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">Your Food, Your Way</p>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 50px 40px;">
                <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 700;">Verify Your Account</h2>
                <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    Thanks for choosing Canteen App! Use the verification code below to complete your sign-in:
                </p>
                
                <!-- OTP Box -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
                    <p style="margin: 0 0 15px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                    <div style="background: rgba(255,255,255,0.95); border-radius: 12px; padding: 20px; display: inline-block; min-width: 200px;">
                        <p style="margin: 0; color: #667eea; font-size: 42px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                    </div>
                </div>
                
                <!-- Info Box -->
                <div style="background: #f7fafc; border-left: 4px solid #667eea; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="margin: 0 0 10px; color: #2d3748; font-size: 14px; font-weight: 600;">
                        ⏱️ Valid for 10 minutes
                    </p>
                    <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.5;">
                        This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                    </p>
                </div>
                
                <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    Need help? Contact our support team anytime.
                </p>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background: #f7fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px; text-align: center; line-height: 1.5;">
                    This is an automated message, please do not reply to this email.
                </p>
                <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                    © 2024 Canteen App. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
    
    <!-- Mobile Optimization -->
    <div style="max-width: 600px; margin: 20px auto; text-align: center;">
        <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">
            Sent with ❤️ from Canteen App
        </p>
    </div>
</body>
</html>
    `.trim();
};
exports.getOTPEmailTemplate = getOTPEmailTemplate;
//# sourceMappingURL=emailTemplates.js.map