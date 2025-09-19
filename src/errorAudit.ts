import type { Request, Response, NextFunction } from "express";
import { appendAudit } from "./routes/audit";

export async function errorAudit(err: any, req: Request, res: Response, next: NextFunction){
  try {
    const status = err?.status || err?.statusCode || 500;
    const explanations = err?.explanations || (status>=400 && status<500 ? ["Handling blokkert av policy"] : undefined);
    await appendAudit({
      route: req.originalUrl,
      method: req.method,
      status,
      wb: req.wb,
      explanations
    });
    res.status(status).json({ error: err?.message || "error", explanations });
  } catch (appendErr) {
    next(appendErr);
  }
}
