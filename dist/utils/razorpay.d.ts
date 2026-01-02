/**
 * Create a Razorpay Order (for Standard Checkout)
 */
export declare const createRazorpayOrder: (orderId: string, amount: number, receipt?: string) => Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
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
 * Get order details from Razorpay
 */
export declare const getRazorpayOrderDetails: (razorpayOrderId: string) => Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
/**
 * Refund a payment
 */
export declare const refundPayment: (paymentId: string, amount: number) => Promise<import("razorpay/dist/types/refunds").Refunds.RazorpayRefund>;
declare const _default: {
    createRazorpayOrder: (orderId: string, amount: number, receipt?: string) => Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    verifyPaymentSignature: (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) => boolean;
    verifyWebhookSignature: (webhookBody: string, webhookSignature: string) => boolean;
    getPaymentDetails: (paymentId: string) => Promise<import("razorpay/dist/types/payments").Payments.RazorpayPayment>;
    getRazorpayOrderDetails: (razorpayOrderId: string) => Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    refundPayment: (paymentId: string, amount: number) => Promise<import("razorpay/dist/types/refunds").Refunds.RazorpayRefund>;
};
export default _default;
//# sourceMappingURL=razorpay.d.ts.map