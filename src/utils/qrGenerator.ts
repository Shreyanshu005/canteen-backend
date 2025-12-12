import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate QR code for an order
 * @param orderId - The order ID to encode
 * @returns Base64 encoded QR code image
 */
export const generateOrderQR = async (orderId: string): Promise<string> => {
    try {
        // Create a secure token for the order
        const secret = process.env.JWT_SECRET || 'secret';
        const timestamp = Date.now();

        // Create payload with order ID and timestamp
        const payload = JSON.stringify({
            orderId,
            timestamp,
        });

        // Create HMAC signature for verification
        const signature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        // Combine payload and signature
        const qrData = JSON.stringify({
            orderId,
            timestamp,
            signature,
        });

        // Generate QR code as base64 data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Verify QR code data
 * @param qrData - The scanned QR code data
 * @returns Object with orderId if valid, null if invalid
 */
export const verifyOrderQR = (qrData: string): { orderId: string; timestamp: number } | null => {
    try {
        const data = JSON.parse(qrData);
        const { orderId, timestamp, signature } = data;

        if (!orderId || !timestamp || !signature) {
            return null;
        }

        // Recreate the payload
        const payload = JSON.stringify({ orderId, timestamp });

        // Verify signature
        const secret = process.env.JWT_SECRET || 'secret';
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            return null;
        }

        // Check if QR code is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - timestamp > maxAge) {
            return null;
        }

        return { orderId, timestamp };
    } catch (error) {
        console.error('Error verifying QR code:', error);
        return null;
    }
};
