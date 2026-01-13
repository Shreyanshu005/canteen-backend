/**
 * Shared logic to fulfill an order after successful payment.
 * This should be used by both manual verification and webhook handlers.
 */
export declare const fulfillOrder: (razorpayOrderId: string, razorpayPaymentId: string, paymentMethod: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=orderFulfillment.service.d.ts.map