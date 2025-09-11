import type { Request, Response, NextFunction } from "express";
import { decide } from "./evaluate";
import { get as cacheGet, put as cachePut } from "../policy/cache";
import { policySource, mergeExplanationWithSources } from "../explain/sources";

const VERSION = "v2";

function setHeaders(res: Response, decision: any, role: string, autonomy: number) {
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
        const base = { mode: (cached as any).mode, reason: (cached as any).reason, policyBasis: `autonomy=${autonomy}; role=${role}`, confidence: 0.56 };
        const enriched = mergeExplanationWithSources(base, [policySource((cached as any).matchedRuleId || "default")]);
        return res.status(403).json({ error: "policy_denied", explanations: [enriched] });
      }
      return next();
    }

    const decision = decide({ autonomyLevel: autonomy, roleId: role, category, risk });
    cachePut(keyParts, decision);
    setHeaders(res, decision, role, autonomy);
    if (!decision.allow) {
      const base = { mode: decision.mode, reason: decision.reason, policyBasis: `autonomy=${autonomy}; role=${role}`, confidence: 0.56 };
      const enriched = mergeExplanationWithSources(base, [policySource(decision.matchedRuleId || "default")]);
      return res.status(403).json({ error: "policy_denied", explanations: [enriched] });
    }
    return next();
  };
}
