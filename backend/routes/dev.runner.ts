import { Router } from 'express';
import { RoleRegistry } from '../../src/roles/registry';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { runCapabilityWithRole } from '../../src/core/capabilityRunnerRole';
import { testCaps } from '../../src/capabilities/testCaps';

const r = Router();
const rr = new RoleRegistry(loadRolesFromRepo(), loadFeaturesFromRepo(), []);

async function policyAllowAlways(){ return { allowed: true, basis: ['dev:allow'] }; }
async function logIntent(i:any){ console.log('[intent]', JSON.stringify(i)); }

r.post('/dev/run', async (req, res) => {
  const { capability, featureId, payload } = req.body || {};
  const L = Number(req.header('x-autonomy') ?? 3) as 1|2|3|4|5|6;
  const tenantId = String(req.header('x-tenant') ?? 'DEV');
  const userId = String(req.header('x-user') ?? 'dev-user');
  const role = String(req.header('x-role') ?? 'sales_rep');

  const impl = (testCaps as any)[capability];
  if (!impl) return res.status(400).json({ error: 'Unknown capability' });

  const out = await runCapabilityWithRole(rr, capability, featureId, payload, {
    autonomy_level: L, tenantId, roleBinding: { userId, primaryRole: role }
  }, impl, policyAllowAlways, logIntent);

  res.json(out);
});

export default r;
