export interface Explanation {
  /**
   * A human-readable reason explaining why an action or suggestion was made.
   */
  reason: string;
  /**
   * A list of sources or evidence that support this explanation.
   */
  sources: string[];
  /**
   * Confidence score between 0 and 1 indicating the strength of this explanation.
   */
  confidence: number;
  /**
   * Alternative suggestions or options that were considered.
   */
  alternatives: any[];
}

/**
 * Helper to create an Explanation object.
 */
export function createExplanation(
  reason: string,
  sources: string[],
  confidence: number,
  alternatives: any[]
): Explanation {
  return { reason, sources, confidence, alternatives };
}
