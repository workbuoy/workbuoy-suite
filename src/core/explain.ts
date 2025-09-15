/**
 * Explainability helpers for Buoy responses.
 * Produces a normalized Explanation[] array used by WhyDrawer.
 */

export interface Explanation {
  reasoning: string;
  sources?: string[];
  confidence?: number;
  impact?: { minutesSaved?: number; dsoDeltaDays?: number; riskReduced?: string };
  policyBasis?: string[];
  alternatives?: string[];
}

export function buildExplanation(input: {
  reasoning: string;
  basis?: string[];
  impact?: { minutesSaved?: number; dsoDeltaDays?: number; riskReduced?: string };
  sources?: string[];
  confidence?: number;
  alternatives?: string[];
}): Explanation {
  return {
    reasoning: input.reasoning,
    sources: input.sources,
    confidence: input.confidence,
    impact: input.impact,
    policyBasis: input.basis,
    alternatives: input.alternatives
  };
}
