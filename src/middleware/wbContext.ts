import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      wb?: {
        intent?: string;
        when?: string;
        autonomy?: number;
        selectedId?: string;
        selectedType?: string;
        correlationId: string;
      }
    }
  }
}

export function wbContext(req: Request, _res: Response, next: NextFunction){
  const h = req.headers;
  req.wb = {
    intent: String(h["x-wb-intent"] || "" ) || undefined,
    when: String(h["x-wb-when"] || "" ) || undefined,
    autonomy: h["x-wb-autonomy"] != null ? Number(h["x-wb-autonomy"]) : undefined,
    selectedId: String(h["x-wb-selected-id"] || "" ) || undefined,
    selectedType: String(h["x-wb-selected-type"] || "" ) || undefined,
    correlationId: (h["x-correlation-id"] as string) || crypto.randomUUID()
  };
  next();
}