import { Router } from 'express';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { RoleRegistry } from '../../src/roles/registry';
import { getActiveFeatures } from '../../src/features/activation/featureActivation';
import { aggregateFeatureUseCount } from '../../src/telemetry/usageSignals';

const r = Router();
const rr = new RoleRegistry(loadRolesFromRepo(), loadFeaturesFromRepo(), []);

r.get('/api/features/active', (req, res) => {
  const tenantId = String(req.header('x-tenant') ?? 'DEV');
  const userId = String(req.header('x-user') ?? 'dev-user');
  const role = String(req.header('x-role') ?? 'sales_rep');
  const usage = aggregateFeatureUseCount(userId);
  const list = getActiveFeatures(rr, { tenantId, userId, roleBinding: { userId, primaryRole: role }, workPatterns: { featureUseCount: usage } });
  res.json(list);
});

export default r;
