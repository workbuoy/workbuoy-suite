export type Explanation = {
  mode: "ask_approval" | "read_only" | "supervised";
  reason: string;
  confidence: number;
  impact?: string;
  alternatives?: string[];
  policyBasis?: string;
  why_status?: "ok" | "deferred";
};

export function confidenceCompose(p: number, data: number, risk: number) {
  const clamp = (x:number)=> Math.max(0, Math.min(1, x));
  return clamp(p * data * risk);
}

export function buildTemplate(input: {
  mode: Explanation["mode"];
  policy: number; data: number; risk: number;
  reason?: string; impact?: string; alternatives?: string[];
  basis: string; deferred?: boolean;
}): Explanation {
  return {
    mode: input.mode,
    reason: input.reason || "Decision by policy template",
    confidence: confidenceCompose(input.policy, input.data, input.risk),
    impact: input.impact,
    alternatives: input.alternatives ?? [],
    policyBasis: input.basis,
    why_status: input.deferred ? "deferred" : "ok"
  };
}
