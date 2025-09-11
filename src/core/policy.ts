import type { Request, Response, NextFunction } from "express";

export type Autonomy = 0 | 1 | 2;
export type Mode = "ask_approval" | "read_only" | "supervised";
export interface PolicyResult {
  allow: boolean;
  mode: Mode;
  reason?: string;
  confidence?: number;
  alternatives?: string[];
  impact?: string;
}

export function evaluatePolicy(_req: Request): PolicyResult {
  const autonomy = Number(_req.headers["x-autonomy"] ?? 0) as Autonomy;
  if (autonomy === 0) return { allow: _req.method === "GET", mode: "ask_approval", reason: "Autonomy 0" };
  if (autonomy === 1) return { allow: _req.method !== "DELETE", mode: "read_only", reason: "Autonomy 1 mitigations" };
  return { allow: true, mode: "supervised" };
}

export function policyGuard(req: Request, res: Response, next: NextFunction) {
  const r = evaluatePolicy(req);
  (req as any).__explanation = r;
  if (!r.allow) return res.status(403).json({ error: { message: "Policy denied" }, explanation: r, correlationId: req.correlationId });
  return next();
}
