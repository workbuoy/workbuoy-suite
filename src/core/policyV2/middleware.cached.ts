import type { Request, Response, NextFunction } from "express";
import { decide } from "./evaluate";
import { get as cacheGet, put as cachePut } from "../policy/cache";

/**
 * Cached policy guard (non-breaking): import and use instead of the default guard
 * to enable LRU caching for decisions. Key includes version + role + autonomy + category + risk + action.
 */
const VERSION = "v2";

function setHeaders(res: Response, decision: ReturnType<typeof decide>, role: string, autonomy: number) {
  res.setHeader("x-policy-mode", decision.mode);
  res.setHeader("x-policy-reason", decision.reason);
  res.setHeader("x-policy-rule", decision.matchedRuleId || "default");
  res.setHeader("x-policy-autonomy", String(autonomy));
  res.setHeader("x-policy-role", role);
}

export function policyV2GuardCached(category: "read"|"write", risk: "low"|"high" = "low") {
  return (req: Request, res: Response, next: NextFunction) => {
    const autonomy = Number((req.headers["x-autonomy"] as string) ?? 0);
    const role = (req.headers["x-role-id"] as string) || "anon";
    const action = (req.body && typeof req.body.intent === "string") ? String(req.body.intent) : req.path;

    const keyParts = { version: VERSION, role, auto: autonomy, cat: category, risk, action };
    const cached = cacheGet(keyParts);
    if (cached) {
      setHeaders(res, cached as any, role, autonomy);
      if (!(cached as any).allow) {
        return res.status(403).json({ error: "policy_denied", explanation: { mode: cached.mode, reason: cached.reason, policyBasis: `autonomy=${autonomy}; role=${role}` } });
      }
      return next();
    }

    const decision = decide({ autonomyLevel: autonomy, roleId: role, category, risk });
    cachePut(keyParts, decision);
    setHeaders(res, decision, role, autonomy);
    if (!decision.allow) {
      return res.status(403).json({ error: "policy_denied", explanation: { mode: decision.mode, reason: decision.reason, policyBasis: `autonomy=${autonomy}; role=${role}` } });
    }
    return next();
  };
}
