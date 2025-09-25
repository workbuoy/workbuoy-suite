import type { Request } from 'express';
import { RoleRegistry } from '../../../../src/roles/registry.js';
import { buildProactivityContext } from '../../../../src/core/proactivity/context.js';
import { parseProactivityMode } from '../../../../src/core/proactivity/modes.js';
import { logModusskift } from '../../../../src/core/proactivity/telemetry.js';
import type { UserRoleBinding } from '../../../../src/roles/types.js';

interface ProactivityResolutionOptions {
  requestedOverride?: any;
  logEvent?: boolean;
  logSource?: string;
  roleBinding?: UserRoleBinding;
}

export function resolveProactivityForRequest(rr: RoleRegistry, req: Request, opts: ProactivityResolutionOptions = {}) {
  const tenantId = String(req.header('x-tenant') || req.header('x-tenant-id') || 'demo');
  const userId = String(req.header('x-user') || req.header('x-user-id') || 'demo-user');
  const role = String(req.header('x-role') || req.header('x-user-role') || 'sales_rep');
  const requestedHeader = req.header('x-proactivity');
  const compatHeader = req.header('x-proactivity-compat');
  const bodyRequested = opts.requestedOverride ?? (req.body as any)?.requestedMode ?? (req.body as any)?.requested ?? (req.body as any)?.mode;
  const featureId = (req.body as any)?.featureId || (req.query as any)?.featureId || undefined;

  const fallbackBinding: UserRoleBinding = { userId, primaryRole: role };
  const roleBinding = opts.roleBinding ?? fallbackBinding;

  const state = buildProactivityContext({
    tenantId,
    roleRegistry: rr,
    roleBinding,
    featureId,
    requestedMode: parseProactivityMode(bodyRequested ?? requestedHeader),
    compatMode: compatHeader,
  });

  (req as any).proactivity = state;
  if (opts.logEvent !== false) {
    logModusskift(state, { tenantId, userId, source: opts.logSource ?? 'api/proactivity' });
  }

  return {
    tenantId,
    userId,
    role: roleBinding.primaryRole ?? role,
    roleBinding,
    featureId,
    state,
    registry: rr,
  };
}
