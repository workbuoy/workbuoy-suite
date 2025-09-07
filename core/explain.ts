export interface Explanation {
  reasoning: string;
  sources: any[];
  confidence: number;
  alternatives?: string[];
  impact?: string;
}

export function createExplanation(
  reasoning: string,
  sources: any[],
  confidence: number = 1,
  alternatives: string[] = [],
  impact?: string
): Explanation {
  return {
    reasoning,
    sources,
    confidence,
    alternatives,
    impact,
  };
}
