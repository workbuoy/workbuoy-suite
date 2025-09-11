import { loadPolicyBundle, Rule } from "./loader";

export type Context = {
  autonomyLevel: number;
  roleId?: string;
  category?: "read" | "write";
  risk?: "low" | "high";
};

export type Decision = {
  allow: boolean;
  mode: "ask_approval" | "read_only" | "supervised";
  reason: string;
  matchedRuleId?: string;
};

function matchRule(rule: Rule, ctx: Context): boolean {
  for (const [k, v] of Object.entries(rule.match || {})) {
    if ((ctx as any)[k] !== v) return false;
  }
  return true;
}

export function decide(ctx: Context): Decision {
  const bundle = loadPolicyBundle();
  const rule = bundle.rules.find(r => matchRule(r, ctx));
  if (rule) {
    const allow = ctx.autonomyLevel >= rule.minAutonomy && rule.mode !== "read_only";
    return {
      allow,
      mode: rule.mode,
      reason: rule.explanation,
      matchedRuleId: rule.id
    };
  }
  // default
  return {
    allow: false,
    mode: bundle.default.mode,
    reason: bundle.default.explanation
  };
}
