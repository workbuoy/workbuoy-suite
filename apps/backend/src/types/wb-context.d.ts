import 'express';

export interface WbContext {
  correlationId?: string;
  autonomyLevel?: string;
  roleId?: string;
  [key: string]: any;
}

declare module 'express-serve-static-core' {
  interface Request {
    wb?: WbContext;
  }
}
