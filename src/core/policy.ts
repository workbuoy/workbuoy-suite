export interface PolicyResult {
  /**
   * Whether the requested action is allowed to execute.
   */
  allowed: boolean;
  /**
   * If true, a human approval is required before execution.
   */
  requireApproval: boolean;
  /**
   * If true, the policy has degraded the autonomy level (e.g., fallback to supervised mode).
   */
  degraded?: boolean;
}

/**
 * Evaluates a simple autonomy-based policy. In a real implementation this would
 * take user roles, context and risk into account.
 */
export function evaluatePolicy(autonomy: number): PolicyResult {
  if (autonomy <= 1) {
    // autonomy 0 or 1: do not allow automatic actions
    return { allowed: false, requireApproval: true };
  }
  if (autonomy === 2) {
    // autonomy 2: proactive suggestions with approval
    return { allowed: true, requireApproval: true };
  }
  if (autonomy === 3) {
    // autonomy 3: ambitious – still require approval for high‑risk actions
    return { allowed: true, requireApproval: true };
  }
  // autonomy >= 4: kraken/tsunami allowed
  return { allowed: true, requireApproval: false };
}
