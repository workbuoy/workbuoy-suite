export type SourceRef = { type: "policy" | "doc" | "rule"; ref: string; note?: string };

export function policySource(ruleId: string, file = "config/policy.rules.json"): SourceRef {
  return { type: "policy", ref: `${file}#${ruleId}` };
}

export function mergeExplanationWithSources(expl: any, sources: SourceRef[]) {
  return { ...expl, sources };
}
