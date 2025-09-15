import type { Request, Response, NextFunction } from "express";
import { auditLog } from "./routes/audit";

export function errorAudit(err: any, req: Request, res: Response, next: NextFunction){
  // map error → response (very light)
  const status = err?.status || err?.statusCode || 500;
  const explanations = err?.explanations || (status>=400 && status<500 ? ["Handling blokkert av policy"] : undefined);
  // push minimal audit row
  auditLog.push({
    ts: new Date().toISOString(),
    route: req.originalUrl,
    method: req.method,
    status,
    wb: req.wb,
    explanations
  } as any);
  res.status(status).json({ error: err?.message || "error", explanations });
}