/**
 * Generate QR code for an order
 * @param orderId - The order ID to encode
 * @returns Base64 encoded QR code image
 */
export declare const generateOrderQR: (orderId: string) => Promise<string>;
/**
 * Verify QR code data
 * @param qrData - The scanned QR code data
 * @returns Object with orderId if valid, null if invalid
 */
export declare const verifyOrderQR: (qrData: string) => {
    orderId: string;
    timestamp: number;
} | null;
//# sourceMappingURL=qrGenerator.d.ts.map