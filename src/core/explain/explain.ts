export interface Action { type: string; payload?: Record<string,unknown>; }
export interface Explanation {
  reasoning: string;
  sources: Array<{ uri: string; label?: string }>;
  confidence: number; // 0..1
  impact?: string|number;
  alternatives?: Action[];
  policyBasis?: string;
}

export function buildExplanation(input: Explanation): Explanation {
  // MVP: passthrough with minimal normalization
  const confidence = Math.max(0, Math.min(1, input.confidence ?? 1));
  return { ...input, confidence };
}
