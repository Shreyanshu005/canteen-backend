import type { Request, Response } from 'express';
export declare const createOrUpdateCanteen: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
export declare const getAllCanteens: (req: Request, res: Response) => Promise<void>;
export declare const getCanteenById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCanteen: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyCanteens: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=canteen.controller.d.ts.map