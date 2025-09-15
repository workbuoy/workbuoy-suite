export type Autonomy = 1|2|3|4|5|6;

export interface PolicyResponse {
  allowed: boolean;
  degraded_mode?: 'ask_approval'|'read_only'|'supervised';
  explanation: string;
  basis?: string[];
  impact?: { minutesSaved?: number; dsoDeltaDays?: number };
}

export async function policyCheck(action: { capability: string }, ctx: { autonomy_level: Autonomy }): Promise<PolicyResponse> {
  // Local simple rules; can be swapped with OPA later
  if (action.capability.startsWith('write:') || action.capability.startsWith('delete:') || action.capability.startsWith('update:')) {
    if (ctx.autonomy_level >= 3) {
      return { allowed: true, explanation: 'Write allowed at ≥3', basis: ['local:write', `autonomy:${ctx.autonomy_level}`] };
    }
    return {
      allowed: false,
      degraded_mode: 'ask_approval',
      explanation: 'Write denied below 3; ask approval',
      basis: ['local:write:deny', `autonomy:${ctx.autonomy_level}`]
    };
  }
  return { allowed: true, explanation: 'Read allowed', basis: ['local:read'] };
}
