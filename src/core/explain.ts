
import type { PolicyResponse } from './types';

export interface Explanation {
  reasoning: string;
  policyBasis?: string[];
  confidence?: number;
  impact?: { minutesSaved?: number; dsoDeltaDays?: number; riskReduced?: string };
}

export function buildExplanation(input: {
  capability: string;
  policy: PolicyResponse;
  outcome?: any;
}): Explanation {
  const base: Explanation = {
    reasoning: templateReasoning(input.capability, input.policy, input.outcome),
    policyBasis: input.policy.basis || [],
    confidence: deriveConfidence(input.capability, input.policy, input.outcome),
    impact: input.policy.impact
  };
  return base;
}

function templateReasoning(cap: string, policy: PolicyResponse, outcome: any): string {
  if (!policy.allowed) {
    return `Handling '${cap}' stoppet av policy: ${policy.explanation}`;
  }
  if (cap === 'finance.invoice.prepareDraft') {
    return 'Utkast foreslått basert på vunnet deal og fakturaflyt. Ingen utsendelse uten godkjenning.';
  }
  if (cap === 'finance.invoice.send') {
    return 'Forsøker å sende faktura i henhold til policy. Faller tilbake til utkast hvis ikke tillatt.';
  }
  return `Handling '${cap}' gjennomført i tråd med policy.`;
}

function deriveConfidence(cap: string, policy: PolicyResponse, outcome: any): number {
  if (!policy.allowed) return 0.4;
  if (cap === 'finance.invoice.prepareDraft') return 0.7;
  return 0.8;
}
