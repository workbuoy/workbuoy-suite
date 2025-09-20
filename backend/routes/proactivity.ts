import { Router } from 'express';
import type { UserRoleBinding } from '../../src/roles/types';
import { getRoleRegistry, resolveUserBinding } from '../../src/roles/service';
import { buildProactivityContext } from '../../src/core/proactivity/context';
import { parseProactivityMode } from '../../src/core/proactivity/modes';
import { logModusskift } from '../../src/core/proactivity/telemetry';

const router: any = Router();

function resolveHeaders(req: any) {
  const tenantId = String(req.header('x-tenant') || req.header('x-tenant-id') || 'demo');
  const userId = String(req.header('x-user') || req.header('x-user-id') || 'demo-user');
  const role = String(req.header('x-role') || req.header('x-user-role') || 'sales_rep');
  const requestedHeader = req.header('x-proactivity');
  return { tenantId, userId, role, requestedHeader };
}

async function computeState(req: any, overrideMode?: any) {
  const { tenantId, userId, role, requestedHeader } = resolveHeaders(req);
  const requested = overrideMode ?? req.body?.requested ?? req.body?.mode ?? requestedHeader;
  const featureId = req.body?.featureId || req.query?.featureId || undefined;
  const registry = await getRoleRegistry();
  const fallbackBinding: UserRoleBinding = { userId, primaryRole: role };
  const binding = (await resolveUserBinding(tenantId, userId, fallbackBinding)) ?? fallbackBinding;
  const state = buildProactivityContext({
    tenantId,
    roleRegistry: registry,
    roleBinding: binding,
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

router.get('/proactivity/state', async (req: any, res: any) => {
  try {
    const { state } = await computeState(req);
    res.json(toResponse(state));
  } catch (err: any) {
    res.status(500).json({ error: 'proactivity_state_error', message: err?.message || String(err) });
  }
});

router.post('/proactivity/state', async (req: any, res: any) => {
  try {
    const { state } = await computeState(req, req.body?.requestedMode ?? req.body?.requested ?? req.body?.mode);
    res.json(toResponse(state));
  } catch (err: any) {
    res.status(500).json({ error: 'proactivity_state_error', message: err?.message || String(err) });
  }
});

export default router;
