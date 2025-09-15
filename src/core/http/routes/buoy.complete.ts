
import { Router } from 'express';
import { runCapability } from '../../capabilityRunner';
import { buildExplanation } from '../../explain';
import { routeFromText } from '../../../router/router';

export function buoyRouter() {
  const r = Router();
  r.post('/buoy/complete', async (req, res) => {
    const autonomy = Number(req.headers['x-autonomy-level'] ?? 3) as any;
    const tenantId = (req as any).wb?.tenantId ?? 'T1';
    const role = (req as any).wb?.roleId ?? 'user';

    const body = req.body || {};
    let capability = body.intent as string | undefined;
    let payload = body.params || {};

    if (!capability && body.text) {
      const routed = routeFromText(body.text);
      capability = routed.capability;
      payload = routed.payload;
    }

    if (capability === 'echo' || (!capability && body.intent === 'echo')) {
      const policy = { allowed: true, explanation: 'echo', basis:['local:echo'] };
      const explanation = buildExplanation({ capability: 'echo', policy, outcome: { ok:true, echo: body.params ?? body } });
      return res.json({
        result: { ok: true, echo: body.params ?? body },
        explanations: [explanation],
        confidence: explanation.confidence ?? 0.8,
        correlationId: (req as any).wb?.correlationId
      });
    }

    const cap = capability || 'crm.deal.search';
    const ctx = { autonomy_level: autonomy, tenantId, role };
    const resRunner = await runCapability<any>(cap, payload, ctx, {
      suggest: async () => ({ suggested: true } as any),
      prepare: async () => ({ prepared: true } as any),
      execute: async () => ({ executed: true } as any),
    });

    const explanation = buildExplanation({ capability: cap, policy: resRunner.policy, outcome: resRunner.outcome });
    const responseBody = {
      result: resRunner.outcome ?? {},
      explanations: [explanation],
      confidence: explanation.confidence ?? 0.7,
      correlationId: (req as any).wb?.correlationId
    };

    if (!resRunner.policy.allowed) {
      return res.status(403).json(responseBody);
    }
    return res.json(responseBody);
  });
  return r;
}
