import { RoleRegistry } from '../../roles/registry';

export interface UserContext {
  tenantId: string;
  userId: string;
  roleBinding: { userId:string; primaryRole:string; secondaryRoles?:string[] };
  workPatterns?: { featureUseCount: Record<string, number> };
  orgContext?: { industry?: string; region?: string; size?: 'smb'|'mid'|'ent' };
}

export function getActiveFeatures(rr: RoleRegistry, uc: UserContext){
  const ctx = rr.getUserContext(uc.tenantId, uc.roleBinding);
  return ctx.features.map((f: any) => {
    const usage = uc.workPatterns?.featureUseCount?.[f.id] ?? 0;
    const industryBoost = (uc.orgContext?.industry === 'finance' && f.id.includes('cashflow')) ? 1 : 0;
    const score = (f.autonomyCap ?? 3) + usage * 0.1 + industryBoost;
    return { ...f, score };
  }).sort((a,b)=> b.score - a.score);
}
