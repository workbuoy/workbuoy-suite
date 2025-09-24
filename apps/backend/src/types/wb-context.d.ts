import "express";

declare global {
  interface WbContext {
    correlationId: string;
    autonomyLevel?: number;
    roleId?: string;
    role?: string;
    intent?: string;
    when?: string;
    autonomy?: number;
    selectedId?: string;
    selectedType?: string;
  }

  namespace Express {
    interface Request {
      wb?: WbContext;
    }
  }
}

export {};
