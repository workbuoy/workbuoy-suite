import { policyCheckRoleAware } from './policyRoleAware';

export async function runCapabilityWithRole<T>(
  rr: any,
  capabilityId: string,
  featureId: string | undefined,
  payload: any,
  ctx: { autonomy_level: 1|2|3|4|5|6; tenantId: string; roleBinding: { userId:string; primaryRole:string; secondaryRoles?:string[] } },
  impl: { observe?:()=>Promise<void>; suggest?:()=>Promise<T>; prepare?:()=>Promise<T>; execute?:()=>Promise<T>; overlay?:()=>Promise<T>; rollback?: (o:T)=>Promise<void>; },
  policyCheckImpl: (input:any, ctx:any)=>Promise<{allowed:boolean; basis?:string[]}>,
  logIntent: (i:any)=>Promise<void>
){
  const policy = await policyCheckRoleAware({ capability: capabilityId, featureId, payload }, ctx, rr, policyCheckImpl);
  const mode = ctx.autonomy_level >= 5 ? 'integration' : 'simulate';
  let outcome: any;

  if (!policy.allowed) {
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload, policy, mode, degraded_mode: 'ask_approval' });
    return { policy };
  }

  try {
    switch (ctx.autonomy_level) {
      case 1: case 2: await impl.observe?.(); break;
      case 3: outcome = await impl.suggest?.(); break;
      case 4: outcome = await impl.prepare?.(); break;
      case 5: outcome = await impl.execute?.(); break;
      case 6: outcome = await (impl.execute?.() ?? impl.overlay?.()); break;
    }
  } finally {
    await logIntent({ tenantId: ctx.tenantId, capability: capabilityId, payload, policy, mode, outcome });
  }
  return { outcome, policy };
}
