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
  const usageMap = uc.workPatterns?.featureUseCount ?? {};
  return ctx.features.map((f: any) => {
    const usage = usageMap[f.id] ?? 0;
    const usageWeight = Math.min(Math.log(usage + 1) * 1.2, 3);
    const industryBoost = (uc.orgContext?.industry === 'finance' && f.id.includes('cashflow')) ? 1
      : (uc.orgContext?.industry === 'sales' && f.id.includes('lead')) ? 0.5
      : 0;
    const autonomyCap = f.autonomyCap ?? f.defaultAutonomyCap ?? 3;
    const score = autonomyCap + usageWeight + industryBoost;
    return {
      ...f,
      autonomyCap,
      score,
      rankBasis: {
        autonomyCap,
        usage,
        usageWeight,
        industryBoost,
      },
    };
  }).sort((a,b)=> b.score - a.score);
}
