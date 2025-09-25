import { Router } from 'express';
import { buildExplanation } from '../core/explain';
import { runCapability } from '../core/capabilityRunner';
import { policyCheck } from '../core/policy';
import { routeFromText } from '../router/nl';

/**
 * POST /buoy/complete
 * Body: { text?: string, intent?: string, params?: object }
 * Returns: { result, explanations[], confidence?, correlationId? }
 */
export function buoyRouter() {
  const r = Router();
  r.post('/complete', async (req: any, res, next) => {
    try {
      const { text, intent, params } = req.body || {};
      const autonomy = Number(req.headers['x-autonomy-level'] ?? 2);
      const role = String(req.headers['x-role-id'] ?? 'user');
      const tenantId = String(req.headers['x-tenant-id'] ?? 'T1');
      const correlationId = (req.wb && req.wb.correlationId) || req.headers['x-correlation-id'] || '';

      const route = intent ? { capability: intent, payload: params || {} } : routeFromText(String(text ?? ''));
      // Pre-check policy to craft explanations regardless of outcome
      const policy = await policyCheck(route, { autonomy_level: autonomy as any, tenantId, role } as any);

      // For MVP: only run capability for safe ones; others just report decision
      let result: any = undefined;
      if (policy.allowed) {
        try {
          const rc = await runCapability(
            route.capability,
            route.payload,
            { autonomy_level: autonomy as any, tenantId, role },
            {},
          );
          result = rc.outcome ?? { ok: true };
        } catch {
          result = { ok: false };
        }
      }

      const explanations = [
        buildExplanation({
          reasoning: policy.explanation || 'policy-eval',
          basis: policy.basis,
          impact: policy.impact,
          confidence: typeof policy.impact?.minutesSaved === 'number' ? 0.8 : 0.6,
          alternatives: policy.degraded_mode ? ['ask_approval', 'read_only', 'supervised'] : undefined
        })
      ];

      res.json({ result, explanations, correlationId, confidence: explanations[0].confidence ?? 0.6 });
    } catch (e) { next(e); }
  });
  return r;
}
