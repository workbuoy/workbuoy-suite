import { RoleRegistry } from '../roles/registry';
import type { UserRoleBinding } from '../roles/types';
import { buildProactivityContext, ProactivityState } from './proactivity/context';
import { ProactivityMode } from './proactivity/modes';

export interface RoleAwareContext {
  tenantId: string;
  roleBinding: UserRoleBinding;
  requestedMode?: ProactivityMode | number | string;
  degradeRail?: ProactivityMode[];
  policyCap?: ProactivityMode;
}

export interface PolicyRoleAwareResult {
  policy: { allowed: boolean; basis?: string[] };
  proactivity: ProactivityState;
  featureId?: string;
}

export async function policyCheckRoleAware(
  base: { capability: string; featureId?: string; payload?: any },
  ctx: RoleAwareContext,
  rr: RoleRegistry,
  policyCheck: (input: any, ctx: any) => Promise<{ allowed: boolean; basis?: string[] }>
): Promise<PolicyRoleAwareResult> {
  const userCtx = rr.getUserContext(ctx.tenantId, ctx.roleBinding);
  const featureId = base.featureId || userCtx.features.find(f => f.capabilities.includes(base.capability))?.id;

  const proactivity = buildProactivityContext({
    tenantId: ctx.tenantId,
    roleRegistry: rr,
    roleBinding: ctx.roleBinding,
    featureId,
    requestedMode: ctx.requestedMode,
    degradeRail: ctx.degradeRail,
    policyCap: ctx.policyCap,
  });

  const policy = await policyCheck(
    { capability: base.capability, payload: base.payload },
    { autonomy_level: proactivity.effective, tenantId: ctx.tenantId, role: userCtx.roles[0]?.role_id ?? 'unknown' }
  );

  const basisSet = new Set<string>([...(policy.basis ?? []), ...proactivity.basis]);
  basisSet.add(featureId ? `feature:${featureId}` : 'feature:unknown');

  return {
    policy: { ...policy, basis: Array.from(basisSet) },
    proactivity,
    featureId,
  };
}
