import { Router } from 'express';
import type { UserRoleBinding } from '../../../src/roles/types.js';
import { getRoleRegistry, resolveUserBinding } from '../../../src/roles/service.js';
import { getActiveFeatures } from '../../../src/features/activation/featureActivation.js';
import { aggregateFeatureUseCount as aggregateInMemory } from '../../../src/telemetry/usageSignals.js';
import { envBool } from '../../../src/core/env.js';

const r = Router();
const usePersistence = envBool('FF_PERSISTENCE', false);

type UsageDbModule = typeof import('../../../src/telemetry/usageSignals.db.js');
let dbModule: UsageDbModule | null = null;

function ensureDbModule(): UsageDbModule {
  if (!dbModule) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    dbModule = require('../../../src/telemetry/usageSignals.db.js') as UsageDbModule;
  }
  return dbModule;
}

// NB: Router mountes under /api i server.ts, så path her skal ikke ha /api-prefiks.
r.get('/features/active', async (req, res) => {
  const tenantId = String(req.header('x-tenant') ?? 'DEV');
  const userId = String(req.header('x-user') ?? 'dev-user');
  const role = String(req.header('x-role') ?? 'sales_rep');

  try {
    const registry = await getRoleRegistry();
    const fallback: UserRoleBinding = { userId, primaryRole: role };
    const binding =
      (await resolveUserBinding(tenantId, userId, fallback)) ?? fallback;

    const usage = usePersistence
      ? await ensureDbModule().aggregateFeatureUseCount(userId, tenantId)
      : aggregateInMemory(userId, tenantId);

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

export default r;
