import { Cashfree } from 'cashfree-pg';
/**
 * Create a Cashfree order for payment
 */
export declare const createCashfreeOrder: (orderId: string, amount: number, customerName: string, customerEmail: string, customerPhone: string) => Promise<any>;
/**
 * Verify payment signature from Cashfree
 */
export declare const verifyPaymentSignature: (orderId: string, orderAmount: string, signature: string, timestamp: string) => boolean;
/**
 * Get payment details from Cashfree
 */
export declare const getPaymentDetails: (orderId: string) => Promise<any>;
export { Cashfree };
//# sourceMappingURL=cashfree.d.ts.map