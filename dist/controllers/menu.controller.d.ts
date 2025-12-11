import type { Request, Response } from 'express';
export declare const addMenuItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMenuItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateItemQuantity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteMenuItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCanteenMenu: (req: Request, res: Response) => Promise<void>;
export declare const getMenuItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=menu.controller.d.ts.map