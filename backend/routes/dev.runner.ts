import { Router } from 'express';
import { RoleRegistry } from '../../src/roles/registry';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { runCapabilityWithRole } from '../../src/core/capabilityRunnerRole';
import { testCaps } from '../../src/capabilities/testCaps';
import { parseProactivityMode } from '../../src/core/proactivity/modes';

const router: any = Router();
const rr = new RoleRegistry(loadRolesFromRepo(), loadFeaturesFromRepo(), []);

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

  const result = await runCapabilityWithRole(
    rr,
    capability,
    featureId,
    payload,
    {
      tenantId,
      roleBinding: { userId, primaryRole: role },
      requestedMode: parseProactivityMode(requestedHeader ?? req.body?.mode),
    },
    impl,
    policyAllowAlways,
    logIntent
  );

  res.json(result);
});

export default router;
