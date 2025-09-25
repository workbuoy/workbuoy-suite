import { Router } from 'express';
import { runCapabilityWithRole } from '../../../src/core/capabilityRunnerRole.js';
import { testCaps } from '../../../src/capabilities/testCaps.js';
import { parseProactivityMode } from '../../../src/core/proactivity/modes.js';
import { getRoleRegistry, resolveUserBinding } from '../../../src/roles/service.js';
import type { UserRoleBinding } from '../../../src/roles/types.js';

const router: any = Router();

async function policyAllowAlways() { return { allowed: true, basis: ['dev:allow'] }; }
async function logIntent(event: any) { console.log('[intent]', JSON.stringify(event)); }

router.post('/dev/run', async (req: any, res: any) => {
  const { capability, featureId, payload } = req.body || {};
  if (!capability) {
    return res.status(400).json({ error: 'capability_required' });
  }

  const impl = (testCaps as any)[capability];
  if (!impl) return res.status(400).json({ error: 'unknown_capability' });

  const tenantId = String(req.header('x-tenant') ?? 'DEV');
  const userId = String(req.header('x-user') ?? 'dev-user');
  const role = String(req.header('x-role') ?? 'sales_rep');
  const requestedHeader = req.header('x-proactivity');
  const compatHeader = req.header('x-proactivity-compat');
  const idempotencyHeader = req.header('idempotency-key') || req.header('Idempotency-Key');

  const registry = await getRoleRegistry();
  const fallback: UserRoleBinding = { userId, primaryRole: role };
  const binding = (await resolveUserBinding(tenantId, userId, fallback)) ?? fallback;

  const result = await runCapabilityWithRole(
    registry,
    capability,
    featureId,
    payload,
    {
      tenantId,
      roleBinding: binding,
      requestedMode: parseProactivityMode(requestedHeader ?? req.body?.mode),
      compatMode: compatHeader,
      idempotencyKey: typeof idempotencyHeader === 'string' ? idempotencyHeader : undefined,
    },
    impl,
    policyAllowAlways,
    logIntent
  );

  res.json(result);
});

export default router;
