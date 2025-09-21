import { Router } from 'express';
import { RoleRegistry } from '../../src/roles/registry';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import type { ProactivityState } from '../../src/core/proactivity/context';
import { resolveProactivityForRequest } from './utils/proactivityContext';

const router: any = Router();

function buildRoleRegistry() {
  const features = loadFeaturesFromRepo();
  try {
    const roles = loadRolesFromRepo();
    return new RoleRegistry(roles, features, []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[proactivity.router] failed to load roles.json; continuing with defaults', message);
    return new RoleRegistry([], features, []);
  }
}

const roleRegistry = buildRoleRegistry();

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
router.get('/proactivity/state', (req: any, res: any) => {
  const { state } = resolveProactivityForRequest(roleRegistry, req);
  res.json(toResponse(state));
});

router.post('/proactivity/state', (req: any, res: any) => {
  const override = req.body?.requestedMode ?? req.body?.requested ?? req.body?.mode;
  const { state } = resolveProactivityForRequest(roleRegistry, req, { requestedOverride: override });
  res.json(toResponse(state));
});

export default router;
