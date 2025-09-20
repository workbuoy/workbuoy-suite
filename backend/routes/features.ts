import { Router } from 'express';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { RoleRegistry } from '../../src/roles/registry';
import { getActiveFeatures } from '../../src/features/activation/featureActivation';
import { aggregateFeatureUseCount } from '../../src/telemetry/usageSignals';

const r = Router();
const FEATURES_ACTIVE_PATH = '/features/active';

function buildRoleRegistry() {
  const features = loadFeaturesFromRepo();
  try {
    const roles = loadRolesFromRepo();
    return new RoleRegistry(roles, features, []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[features.router] failed to load roles.json; continuing with defaults', message);
    return new RoleRegistry([], features, []);
  }
}

const rr = buildRoleRegistry();

r.get(FEATURES_ACTIVE_PATH, (req, res) => {
  const tenantId = String(req.header('x-tenant') ?? 'DEV');
  const userId = String(req.header('x-user') ?? 'dev-user');
  const role = String(req.header('x-role') ?? 'sales_rep');
  const usage = aggregateFeatureUseCount(userId);
  const list = getActiveFeatures(rr, { tenantId, userId, roleBinding: { userId, primaryRole: role }, workPatterns: { featureUseCount: usage } });
  res.json(list);
});

export default r;
