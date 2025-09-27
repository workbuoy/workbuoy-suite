declare module 'express-rate-limit' {
  import type { RequestHandler } from 'express';

  export interface RateLimitRequestHandlerOptions {
    windowMs?: number;
    max?: number | ((req: any, res: any) => number);
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    message?: any;
    handler?: (request: any, response: any, next: (err?: any) => void, optionsUsed: RateLimitRequestHandlerOptions) => void;
    keyGenerator?: (req: any, res: any) => string;
    skip?: (req: any, res: any) => boolean;
    requestWasSuccessful?: (req: any, res: any) => boolean;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    headers?: boolean;
  }

  export interface RateLimitInfo {
    limit: number;
    current: number;
    remaining: number;
    resetTime?: Date;
  }

  export interface RateLimitRequestHandler extends RequestHandler {
    resetKey(key: string): void;
  }

  export default function rateLimit(options?: RateLimitRequestHandlerOptions): RateLimitRequestHandler;
}
