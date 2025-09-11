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

/** MVP policy: autonomy via header; enforces 0–2 */
export function evaluatePolicy(req: Request): PolicyResult {
  const autonomy = Number(req.headers["x-autonomy"] ?? 0) as Autonomy;

  if (autonomy === 0) {
    return {
      allow: req.method === "GET",
      mode: "ask_approval",
      reason: "Autonomy 0",
    };
  }

  if (autonomy === 1) {
    return {
      allow: req.method !== "DELETE",
      mode: "read_only",
      reason: "Autonomy 1 mitigations",
    };
  }

  // autonomy === 2
  return { allow: true, mode: "supervised" };
}

/** Express middleware that denies when policy says no; attaches explanation to req */
export function policyGuard(req: Request, res: Response, next: NextFunction) {
  const result = evaluatePolicy(req);
  (req as any).__explanation = result; // surfaced via API/UI (WhyDrawer)
  if (!result.allow) {
    return res
      .status(403)
      .json({ error: { message: "Policy denied" }, explanation: result, correlationId: (req as any).correlationId });
  }
  return next();
}
