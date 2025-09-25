import { Router } from 'express';
import { RoleRegistry } from '../../../src/roles/registry.js';
import { loadRoleCatalog } from '../../../src/roles/loader.js';
import type { ProactivityState } from '../../../src/core/proactivity/context.js';
import { resolveProactivityForRequest } from './utils/proactivityContext.js';
import { envBool } from '../../../src/core/env.js';
import { getRoleRegistry, resolveUserBinding } from '../../../src/roles/service.js';
import type { UserRoleBinding } from '../../../src/roles/types.js';

const router: any = Router();

function buildRoleRegistry() {
  try {
    const catalog = loadRoleCatalog();
    return new RoleRegistry(catalog.roles, catalog.features, []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[proactivity.router] failed to load role catalog; continuing with defaults', message);
    return new RoleRegistry([], [], []);
  }
}

const fallbackRegistry = buildRoleRegistry();
const usePersistence = envBool('FF_PERSISTENCE', false);

async function selectRegistry() {
  if (usePersistence) {
    return getRoleRegistry();
  }
  return fallbackRegistry;
}

async function resolveBinding(req: any): Promise<{ tenantId: string; userId: string; role: string; binding: UserRoleBinding }>
{
  const tenantId = String(req.header('x-tenant') || req.header('x-tenant-id') || 'demo');
  const userId = String(req.header('x-user') || req.header('x-user-id') || 'demo-user');
  const role = String(req.header('x-role') || req.header('x-user-role') || 'sales_rep');
  const fallback: UserRoleBinding = { userId, primaryRole: role };
  const binding = (await resolveUserBinding(tenantId, userId, fallback)) ?? fallback;
  return { tenantId, userId, role, binding };
}

function toResponse(state: ProactivityState) {
  return {
    tenantId: state.tenantId,
    requested: state.requested,
    requestedKey: state.requestedKey,
    effective: state.effective,
    effectiveKey: state.effectiveKey,
    basis: state.basis,
    caps: state.caps,
    degradeRail: state.degradeRail,
    uiHints: state.uiHints,
    chip: state.chip,
    subscription: state.subscription,
    featureId: state.featureId,
    timestamp: state.timestamp,
  };
}

// NB: Router mountes under /api i server.ts, så path her skal ikke ha /api-prefiks.
router.get('/proactivity/state', async (req: any, res: any) => {
  try {
    const registry = await selectRegistry();
    const { binding } = await resolveBinding(req);
    const { state } = resolveProactivityForRequest(registry, req, { roleBinding: binding });
    res.json(toResponse(state));
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'proactivity_state_failed', message: err?.message || String(err) });
  }
});

router.post('/proactivity/state', async (req: any, res: any) => {
  try {
    const registry = await selectRegistry();
    const { binding } = await resolveBinding(req);
    const override = req.body?.requestedMode ?? req.body?.requested ?? req.body?.mode;
    const { state } = resolveProactivityForRequest(registry, req, {
      requestedOverride: override,
      roleBinding: binding,
    });
    res.json(toResponse(state));
  } catch (err: any) {
    res
      .status(500)
      .json({ error: 'proactivity_state_failed', message: err?.message || String(err) });
  }
});

export default router;
