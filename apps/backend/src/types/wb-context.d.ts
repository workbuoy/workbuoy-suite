import 'express';

export interface WbContext {
  correlationId?: string;
  autonomyLevel?: string;
  roleId?: string;
  intent?: string;
  when?: string | number | Date;
  autonomy?: string | number;
  selectedId?: string;
  selectedType?: string;
  [key: string]: any;
}

declare module 'express-serve-static-core' {
  interface Request {
    wb?: WbContext;
  }
}
