import { Router } from 'express';
import { getRoleRegistry, resolveUserBinding } from '../../src/roles/registryProvider';
import { runCapabilityWithRole } from '../../src/core/capabilityRunnerRole';
import { testCaps } from '../../src/capabilities/testCaps';
import { parseProactivityMode } from '../../src/core/proactivity/modes';

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

  try {
    const [registry, binding] = await Promise.all([
      getRoleRegistry(),
      resolveUserBinding(userId, role),
    ]);

    const result = await runCapabilityWithRole(
      registry,
      capability,
      featureId,
      payload,
      {
        tenantId,
        roleBinding: binding,
        requestedMode: parseProactivityMode(requestedHeader ?? req.body?.mode),
      },
      impl,
      policyAllowAlways,
      logIntent
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'dev_runner_failed', message: err?.message || String(err) });
  }
});

export default router;
