import 'express';

interface WbContextBase {
  correlationId?: string;
  autonomyLevel?: string | number;
  roleId?: string;
  role?: string;
  intent?: string;
  when?: string | number | Date;
  autonomy?: string | number;
  selectedId?: string;
  selectedType?: string;
  [key: string]: any;
}

export interface WbContext extends WbContextBase {}

declare global {
  interface WbContext extends WbContextBase {}
}

declare module 'express-serve-static-core' {
  interface Request {
    wb?: WbContext;
  }
}
