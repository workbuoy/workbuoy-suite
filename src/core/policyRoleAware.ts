import { RoleRegistry } from '../roles/registry';

type L = 1|2|3|4|5|6;

export async function policyCheckRoleAware(
  base: { capability: string; featureId?: string; payload?: any },
  ctx: { autonomy_level: L; tenantId: string; roleBinding: { userId:string; primaryRole:string; secondaryRoles?:string[] } },
  rr: RoleRegistry,
  policyCheck: (input:any, ctx:any)=>Promise<{allowed:boolean; basis?:string[]}>
){
  const userCtx = rr.getUserContext(ctx.tenantId, ctx.roleBinding);
  const featureId = base.featureId || userCtx.features.find(f => f.capabilities.includes(base.capability))?.id;
  const cap = featureId ? (userCtx.featureCaps[featureId] ?? 3) : 3;

  if (ctx.autonomy_level > cap) {
    return { allowed: false, basis: [`roleCap:${featureId}`, `autonomy:${ctx.autonomy_level}`] };
  }

  const res = await policyCheck({ capability: base.capability, payload: base.payload }, {
    autonomy_level: ctx.autonomy_level, tenantId: ctx.tenantId, role: userCtx.roles[0]?.role_id ?? 'unknown'
  });
  return { ...res, basis: [...(res.basis||[]), featureId ? `feature:${featureId}` : 'feature:unknown'] };
}
