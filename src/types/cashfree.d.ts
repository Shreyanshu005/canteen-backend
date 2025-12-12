// Type declarations for cashfree-pg to suppress TypeScript errors
declare module 'cashfree-pg' {
    export class Cashfree {
        static XClientId: string;
        static XClientSecret: string;
        static XEnvironment: any;
        static Environment: {
            PRODUCTION: any;
            SANDBOX: any;
        };
        static PGCreateOrder(version: string, request: any): Promise<any>;
        static PGOrderFetchPayments(version: string, orderId: string): Promise<any>;
    }
}
