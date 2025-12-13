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
    <title>Your BunkBite OTP Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #ff6b6b 0%, #f62f56 50%, #ee5a6f 100%); min-height: 100vh; padding: 40px 20px;">
    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 70px rgba(246, 47, 86, 0.4);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #f62f56 0%, #ff4757 100%); padding: 50px 30px; text-align: center; position: relative;">
                <!-- Decorative circles -->
                <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(10px);"></div>
                <div style="position: absolute; bottom: -20px; left: -20px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(10px);"></div>
                
                <!-- Logo/Icon -->
                <div style="background: rgba(255,255,255,0.25); backdrop-filter: blur(15px); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: relative; z-index: 1;">
                    <span style="font-size: 50px;">🍔</span>
                </div>
                
                <h1 style="margin: 0; color: white; font-size: 36px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0,0,0,0.2); position: relative; z-index: 1;">BunkBite</h1>
                <p style="margin: 12px 0 0; color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 600; letter-spacing: 0.5px; position: relative; z-index: 1;">Skip the Queue, Savor the Flavor</p>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 50px 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 12px; color: #1a202c; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Verify Your Account</h2>
                    <p style="margin: 0; color: #718096; font-size: 16px; line-height: 1.6;">
                        Welcome to BunkBite! 🎉
                    </p>
                </div>
                
                <p style="margin: 0 0 35px; color: #4a5568; font-size: 16px; line-height: 1.7; text-align: center;">
                    We're excited to have you on board. Use the verification code below to complete your sign-in and start ordering delicious food!
                </p>
                
                <!-- OTP Box -->
                <div style="background: linear-gradient(135deg, #f62f56 0%, #ff4757 100%); border-radius: 20px; padding: 35px 30px; text-align: center; margin: 35px 0; box-shadow: 0 15px 40px rgba(246, 47, 86, 0.35); position: relative; overflow: hidden;">
                    <!-- Decorative pattern -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%); opacity: 0.6;"></div>
                    
                    <p style="margin: 0 0 18px; color: rgba(255,255,255,0.95); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1;">Your Verification Code</p>
                    
                    <div style="background: white; border-radius: 16px; padding: 28px 20px; display: inline-block; min-width: 240px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); position: relative; z-index: 1;">
                        <p style="margin: 0; color: #f62f56; font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(246, 47, 86, 0.1);">${otp}</p>
                    </div>
                </div>
                
                <!-- Info Box -->
                <div style="background: linear-gradient(135deg, #fff5f7 0%, #ffe8ec 100%); border-left: 5px solid #f62f56; border-radius: 12px; padding: 24px 28px; margin: 35px 0; box-shadow: 0 4px 15px rgba(246, 47, 86, 0.08);">
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <span style="font-size: 20px; margin-right: 12px;">⏱️</span>
                        <div>
                            <p style="margin: 0 0 8px; color: #2d3748; font-size: 15px; font-weight: 700;">
                                Valid for 10 minutes
                            </p>
                            <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                This code will expire in 10 minutes for your security.
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: flex-start; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(246, 47, 86, 0.15);">
                        <span style="font-size: 20px; margin-right: 12px;">🔒</span>
                        <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.6;">
                            If you didn't request this code, please ignore this email. Your account is safe.
                        </p>
                    </div>
                </div>
                
                <!-- CTA Section -->
                <div style="text-align: center; margin: 40px 0 30px;">
                    <p style="margin: 0 0 20px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                        Once verified, you can:
                    </p>
                    <div style="display: inline-block; text-align: left;">
                        <p style="margin: 8px 0; color: #718096; font-size: 14px;">✨ Browse delicious menu items</p>
                        <p style="margin: 8px 0; color: #718096; font-size: 14px;">🛒 Order food instantly</p>
                        <p style="margin: 8px 0; color: #718096; font-size: 14px;">⚡ Skip the canteen queue</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 35px; padding-top: 30px; border-top: 2px dashed #e2e8f0;">
                    <p style="margin: 0; color: #a0aec0; font-size: 14px; line-height: 1.6;">
                        Need help? We're here for you!<br>
                        <a href="mailto:support@bunkbite.com" style="color: #f62f56; text-decoration: none; font-weight: 600;">Contact Support</a>
                    </p>
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background: linear-gradient(to bottom, #ffffff 0%, #f7fafc 100%); padding: 35px 40px; border-top: 1px solid #e2e8f0;">
                <div style="text-align: center;">
                    <p style="margin: 0 0 8px; color: #cbd5e0; font-size: 12px; line-height: 1.6;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                    <p style="margin: 0 0 16px; color: #cbd5e0; font-size: 12px;">
                        © 2024 BunkBite. All rights reserved.
                    </p>
                    
                    <!-- Social Links (optional) -->
                    <div style="margin-top: 16px;">
                        <a href="#" style="display: inline-block; margin: 0 8px; color: #a0aec0; text-decoration: none; font-size: 20px;">📱</a>
                        <a href="#" style="display: inline-block; margin: 0 8px; color: #a0aec0; text-decoration: none; font-size: 20px;">🌐</a>
                        <a href="#" style="display: inline-block; margin: 0 8px; color: #a0aec0; text-decoration: none; font-size: 20px;">📧</a>
                    </div>
                </div>
            </td>
        </tr>
    </table>
    
    <!-- Mobile Optimization Footer -->
    <div style="max-width: 600px; margin: 25px auto; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            Made with ❤️ by BunkBite Team
        </p>
    </div>
</body>
</html>
    `.trim();
};
exports.getOTPEmailTemplate = getOTPEmailTemplate;
//# sourceMappingURL=emailTemplates.js.map