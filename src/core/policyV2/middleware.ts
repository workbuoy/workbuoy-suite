import type { Request, Response, NextFunction } from "express";
import { decide } from "./evaluate";

export function policyV2Guard(category: "read" | "write", risk: "low" | "high" = "low") {
  return (req: Request, res: Response, next: NextFunction) => {
    const autonomy = Number((req.headers["x-autonomy"] as string) ?? 0);
    const role = (req.headers["x-role-id"] as string) || "anon";
    const decision = decide({ autonomyLevel: autonomy, roleId: role, category, risk });

    res.setHeader("x-policy-mode", decision.mode);
    res.setHeader("x-policy-reason", decision.reason);
    res.setHeader("x-policy-rule", decision.matchedRuleId || "default");

    if (!decision.allow) {
      return res.status(403).json({
        error: "policy_denied",
        explanation: {
          mode: decision.mode,
          reason: decision.reason,
          policyBasis: `autonomy=${autonomy}; role=${role}`
        }
      });
    }
    return next();
  };
}
