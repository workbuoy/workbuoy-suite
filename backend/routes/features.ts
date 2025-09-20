import { Router } from 'express';
import { getRoleRegistry, resolveUserBinding } from '../../src/roles/registryProvider';
import { getActiveFeatures } from '../../src/features/activation/featureActivation';
import { aggregateFeatureUseCount } from '../../src/telemetry/usageSignals';
import { persistenceEnabled } from '../../src/core/config/dbFlag';

const r = Router();

r.get('/features/active', async (req, res) => {
  const tenantId = String(req.header('x-tenant') ?? req.header('x-tenant-id') ?? 'DEV');
  const userId = String(req.header('x-user') ?? req.header('x-user-id') ?? 'dev-user');
  const requestedRole = String(req.header('x-role') ?? req.header('x-user-role') ?? 'sales_rep');

  try {
    const [registry, usage, binding] = await Promise.all([
      getRoleRegistry(),
      aggregateFeatureUseCount(userId, tenantId),
      resolveUserBinding(userId, requestedRole),
    ]);

    const features = getActiveFeatures(registry, {
      tenantId,
      userId,
      roleBinding: binding,
      workPatterns: { featureUseCount: usage },
    });

    if (!features.length && !persistenceEnabled()) {
      return res.status(204).end();
    }

    return res.json({ tenantId, userId, features });
  } catch (err: any) {
    return res.status(500).json({ error: 'features_active_failed', message: err?.message || String(err) });
  }
});

export default r;
