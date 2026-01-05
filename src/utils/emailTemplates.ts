export const getOTPEmailTemplate = (otp: string): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BunkBite Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #1a1a1a;">
    <table role="presentation" style="width: 100%; max-width: 500px; margin: 40px auto; border: 1px solid #eeeeee; border-radius: 8px; border-collapse: separate;">
        <tr>
            <td style="padding: 40px 30px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #F62F56; margin-bottom: 30px;">
                    BunkBite
                </div>
                
                <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: 600;">Verification Code</h2>
                
                <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.5;">
                    Your verification code is <strong>${otp}</strong>. Please use it to log in to your BunkBite account.
                </p>
                
                <div style="background-color: #F62F56; color: #ffffff; padding: 15px 25px; border-radius: 6px; display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin-bottom: 30px;">
                    ${otp}
                </div>
                
                <p style="margin: 0; color: #999999; font-size: 13px;">
                    This code will expire in 10 minutes.<br>
                    If you didn't request this code, you can safely ignore this email.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};