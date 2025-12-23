export const getOTPEmailTemplate = (otp: string): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; padding: 40px 20px;">
    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Account Verification</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 48px 40px;">
                <p style="margin: 0 0 24px; color: #2d3748; font-size: 16px; line-height: 1.6;">
                    Hello,
                </p>
                
                <p style="margin: 0 0 32px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    We received a request to verify your account. Please use the verification code below to complete the process.
                </p>
                
                <!-- For iOS/Android OTP autofill detection -->
                <div style="display: none;">Your verification code is: ${otp}</div>
                
                <!-- OTP Box -->
                <div style="background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 32px 24px; text-align: center; margin: 32px 0;">
                    <p style="margin: 0 0 12px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Verification Code</p>
                    
                    <div style="background: white; border: 2px dashed #cbd5e0; border-radius: 8px; padding: 20px; display: inline-block; min-width: 200px;">
                        <p style="margin: 0; color: #2d3748; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                    </div>
                </div>
                
                <!-- Security Info -->
                <div style="background: #edf2f7; border-left: 4px solid #4299e1; border-radius: 6px; padding: 20px 24px; margin: 32px 0;">
                    <div style="display: flex; align-items: flex-start;">
                        <span style="font-size: 18px; margin-right: 12px;">🔒</span>
                        <div>
                            <p style="margin: 0 0 8px; color: #2d3748; font-size: 14px; font-weight: 600;">
                                Security Information
                            </p>
                            <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                                This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                            </p>
                        </div>
                    </div>
                </div>
                
                <p style="margin: 32px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    For security reasons, never share this code with anyone. Our team will never ask for your verification code.
                </p>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background: #f7fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
                <div style="text-align: center;">
                    <p style="margin: 0 0 8px; color: #a0aec0; font-size: 13px; line-height: 1.5;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                    <p style="margin: 0; color: #cbd5e0; font-size: 12px;">
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};