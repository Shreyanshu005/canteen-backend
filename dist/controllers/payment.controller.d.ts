import type { Request, Response } from 'express';
export declare const initiatePayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleWebhook: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.controller.d.ts.map