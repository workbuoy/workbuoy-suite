import { Router } from 'express';
import type { UserRoleBinding } from '../../../src/roles/types.js';
import { getRoleRegistry, resolveUserBinding } from '../../../src/roles/service.js';
import { getActiveFeatures } from '../../../src/features/activation/featureActivation.js';
import { envBool } from '../../../src/core/env.js';
import { getTelemetryFallbackStore, ensureTelemetryPersistentStore } from '../src/telemetryContext.js';

const router = Router();
const usePersistence = envBool('FF_PERSISTENCE', false);
const fallbackStore = getTelemetryFallbackStore();

function getTelemetryStore() {
  return usePersistence ? ensureTelemetryPersistentStore() : fallbackStore;
}

// NB: Router mountes under /api i server.ts, så path her skal ikke ha /api-prefiks.
router.get('/features/active', async (req, res) => {
  const tenantId = String(req.header('x-tenant') ?? 'DEV');
  const userId = String(req.header('x-user') ?? 'dev-user');
  const role = String(req.header('x-role') ?? 'sales_rep');

  try {
    const registry = await getRoleRegistry();
    const fallback: UserRoleBinding = { userId, primaryRole: role };
    const binding = (await resolveUserBinding(tenantId, userId, fallback)) ?? fallback;

    const usageStore = getTelemetryStore();
    const aggregate = (usageStore as any).aggregateFeatureUseCount;
    const usage = typeof aggregate === 'function'
      ? await aggregate.call(usageStore, userId, tenantId)
      : {};

    const orgContext = {
      industry: req.header('x-industry') ?? undefined,
      region: req.header('x-region') ?? undefined,
      size: (req.header('x-tenant-size') as 'smb' | 'mid' | 'ent' | undefined) ?? undefined,
    };

    const list = getActiveFeatures(registry, {
      tenantId,
      userId,
      roleBinding: binding,
      workPatterns: { featureUseCount: usage },
      orgContext,
    });

    res.json(list);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'feature_activation_failed', message: err?.message || String(err) });
  }
});

export default router;
