import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      wb?: { correlationId?: string };
    }
  }
}

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  const correlationId = req.headers["x-correlation-id"]?.toString() || randomUUID();
  req.correlationId = correlationId;
  const existing = (req as any).wb || {};
  (req as any).wb = { ...existing, correlationId };
  next();
}
