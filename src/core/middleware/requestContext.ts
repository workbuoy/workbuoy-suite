import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  req.correlationId = req.headers["x-correlation-id"]?.toString() || randomUUID();
  next();
}
