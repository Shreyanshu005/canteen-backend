/**
 * Create a Razorpay Payment Link
 */
export declare const createPaymentLink: (orderId: string, amount: number, customerName: string, customerEmail: string, customerPhone: string) => Promise<import("razorpay/dist/types/paymentLink").PaymentLinks.RazorpayPaymentLink>;
/**
 * Verify Razorpay payment signature
 */
export declare const verifyPaymentSignature: (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => boolean;
/**
 * Verify webhook signature
 */
export declare const verifyWebhookSignature: (webhookBody: string, webhookSignature: string) => boolean;
/**
 * Get payment details from Razorpay
 */
export declare const getPaymentDetails: (paymentId: string) => Promise<import("razorpay/dist/types/payments").Payments.RazorpayPayment>;
/**
 * Get payment link details
 */
export declare const getPaymentLinkDetails: (paymentLinkId: string) => Promise<import("razorpay/dist/types/paymentLink").PaymentLinks.RazorpayPaymentLink>;
declare const _default: {
    createPaymentLink: (orderId: string, amount: number, customerName: string, customerEmail: string, customerPhone: string) => Promise<import("razorpay/dist/types/paymentLink").PaymentLinks.RazorpayPaymentLink>;
    verifyPaymentSignature: (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => boolean;
    verifyWebhookSignature: (webhookBody: string, webhookSignature: string) => boolean;
    getPaymentDetails: (paymentId: string) => Promise<import("razorpay/dist/types/payments").Payments.RazorpayPayment>;
    getPaymentLinkDetails: (paymentLinkId: string) => Promise<import("razorpay/dist/types/paymentLink").PaymentLinks.RazorpayPaymentLink>;
};
export default _default;
//# sourceMappingURL=razorpay.d.ts.map