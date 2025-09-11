export interface PolicyResult {
  allowed: boolean;
  requireApproval: boolean;
  reason?: string;
}

export function evaluatePolicy(role: string, autonomyLevel: number, confidence: number): PolicyResult {
  // Simple stub: deny write operations for autonomy <=2 by requiring approval
  if (autonomyLevel <= 2) {
    return { allowed: false, requireApproval: true, reason: 'Read-only autonomy level' };
  }
  // autonomy level 3 requires approval
  if (autonomyLevel === 3) {
    return { allowed: true, requireApproval: true };
  }
  // autonomy level 4 or higher is allowed without approval
  return { allowed: true, requireApproval: false };
}
