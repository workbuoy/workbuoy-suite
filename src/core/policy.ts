import type { Autonomy, PolicyResponse } from './types';

const LOCAL_RULES: Record<string, (lvl: Autonomy) => PolicyResponse> = {
  'finance.invoice.send': (lvl: Autonomy) => ({
    allowed: lvl >= 5,
    degraded_mode: lvl < 5 ? 'ask_approval' : undefined,
    explanation: lvl >= 5 ? 'Allowed at Kraken+' : 'Execution requires approval below Kraken',
    basis: ['rule:cap.finance.send', `autonomy:${lvl}`]
  }),
  'finance.invoice.prepareDraft': (lvl: Autonomy) => ({
    allowed: lvl >= 4,
    degraded_mode: lvl < 4 ? 'ask_approval' : undefined,
    explanation: lvl >= 4 ? 'Prepare allowed at Ambisiøs+' : 'Suggestion only',
    basis: ['rule:cap.finance.prepareDraft', `autonomy:${lvl}`],
    impact: { minutesSaved: 18, dsoDeltaDays: 3 }
  }),
  'finance.payment.suggestReminder': (lvl: Autonomy) => ({
    allowed: lvl >= 2,
    explanation: 'Reminder suggestions allowed from Rolig+',
    basis: ['rule:cap.finance.reminder', `autonomy:${lvl}`]
  }),
};

export async function policyCheck(action: { capability: string; payload?: any }, ctx: {
  autonomy_level: Autonomy; tenantId: string; role: string; risk?: Record<string, any>
}): Promise<PolicyResponse> {
  const opa = process.env.OPA_URL;
  if (opa) {
    try {
      const body = { input: { action, ctx } };
      const res = await fetch(`${opa}/v1/data/workbuoy/allow`, {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.result) return data.result as PolicyResponse;
      }
    } catch { /* fallthrough to local */ }
  }
  const rule = LOCAL_RULES[action.capability];
  if (rule) return rule(ctx.autonomy_level);
  // default permissive (dev)
  return { allowed: true, explanation: 'local-permissive', basis: ['local:permissive'] };
}
