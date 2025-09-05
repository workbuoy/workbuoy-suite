// Core explanation helpers stub
export interface Explanation {
  source: string;
  ref: string;
  why: string;
}

export function buildExplanation(source: string, ref: string, why: string): Explanation {
  return { source, ref, why };
}
