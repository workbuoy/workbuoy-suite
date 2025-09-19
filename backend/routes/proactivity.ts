import { Router } from 'express';
import { RoleRegistry } from '../../src/roles/registry';
import { loadRolesFromRepo, loadFeaturesFromRepo } from '../../src/roles/loader';
import { buildProactivityContext } from '../../src/core/proactivity/context';
import { parseProactivityMode } from '../../src/core/proactivity/modes';
import { logModusskift } from '../../src/core/proactivity/telemetry';

const router: any = Router();
const roleRegistry = new RoleRegistry(loadRolesFromRepo(), loadFeaturesFromRepo(), []);

function resolveHeaders(req: any) {
  const tenantId = String(req.header('x-tenant') || req.header('x-tenant-id') || 'demo');
  const userId = String(req.header('x-user') || req.header('x-user-id') || 'demo-user');
  const role = String(req.header('x-role') || req.header('x-user-role') || 'sales_rep');
  const requestedHeader = req.header('x-proactivity');
  return { tenantId, userId, role, requestedHeader };
}

function computeState(req: any, overrideMode?: any) {
  const { tenantId, userId, role, requestedHeader } = resolveHeaders(req);
  const requested = overrideMode ?? req.body?.requested ?? req.body?.mode ?? requestedHeader;
  const featureId = req.body?.featureId || req.query?.featureId || undefined;
  const state = buildProactivityContext({
    tenantId,
    roleRegistry,
    roleBinding: { userId, primaryRole: role },
    requestedMode: parseProactivityMode(requested),
    featureId,
  });
  req.proactivity = state;
  logModusskift(state, { tenantId, userId, source: 'api/proactivity' });
  return { tenantId, userId, state };
}

function toResponse(state: ReturnType<typeof buildProactivityContext>) {
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
    subscription: state.subscription,
    featureId: state.featureId,
    timestamp: state.timestamp,
  };
}

router.get('/proactivity/state', (req: any, res: any) => {
  const { state } = computeState(req);
  res.json(toResponse(state));
});

router.post('/proactivity/state', (req: any, res: any) => {
  const { state } = computeState(req, req.body?.requestedMode ?? req.body?.requested ?? req.body?.mode);
  res.json(toResponse(state));
});

export default router;
