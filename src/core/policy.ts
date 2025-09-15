/**
 * Policy facade with local rules and optional OPA HTTP fallback.
 * No external dependency required; switch to OPA by setting OPA_URL env.
 */
import type { Autonomy, PolicyResponse } from './types';

type Capability = string;

const LOCAL_RULES: Record<Capability, (lvl: Autonomy) => PolicyResponse> = {
  'finance.invoice.send': (lvl) => ({
    allowed: lvl >= 5,
    degraded_mode: lvl < 5 ? 'ask_approval' : undefined,
    explanation: lvl >= 5
      ? 'Allowed at Kraken (>=5)'
      : 'Execution requires approval below Kraken',
    basis: ['local:rule.cap.finance.send', `autonomy:${lvl}`],
  }),
  'finance.invoice.prepareDraft': (lvl) => ({
    allowed: lvl >= 4,
    degraded_mode: lvl < 4 ? 'ask_approval' : undefined,
    explanation: lvl >= 4 ? 'Prepare allowed at Ambisiøs (>=4)' : 'Suggestion only',
    basis: ['local:rule.cap.finance.prepareDraft', `autonomy:${lvl}`],
    impact: { minutesSaved: 18, dsoDeltaDays: 3 }, // heuristic baseline
  }),
  'finance.payment.suggestReminder': (lvl) => ({
    allowed: lvl >= 2,
    explanation: 'Reminder suggestions allowed from Rolig (>=2)',
    basis: ['local:rule.cap.finance.reminder', `autonomy:${lvl}`],
  }),
};

/**
 * Evaluate a policy decision for a capability + context.
 * If OPA_URL is set, try OPA first then fall back to local rules.
 */
export async function policyCheck(
  action: { capability: Capability; payload?: any },
  ctx: { autonomy_level: Autonomy; tenantId: string; role: string; risk?: Record<string, any> }
): Promise<PolicyResponse> {
  const opaUrl = process.env.OPA_URL;
  if (opaUrl) {
    try {
      const body = { input: { action, ctx } };
      const res = await fetch(`${opaUrl.replace(/\/$/,'')}/v1/data/workbuoy/allow`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.result) return data.result as PolicyResponse;
      }
    } catch {
      // fall back to local rules
    }
  }
  const rule = LOCAL_RULES[action.capability];
  if (rule) return rule(ctx.autonomy_level);
  return { allowed: true, explanation: 'local-permissive', basis: ['local:permissive'] };
}
