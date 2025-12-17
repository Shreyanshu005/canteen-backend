import type { Request, Response } from 'express';
export declare const sendOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map