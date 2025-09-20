import { RoleRegistry } from '../../roles/registry';

export interface UserContext {
  tenantId: string;
  userId: string;
  roleBinding: { userId: string; primaryRole: string; secondaryRoles?: string[] };
  workPatterns?: { featureUseCount: Record<string, number> };
  orgContext?: { industry?: string; region?: string; size?: 'smb' | 'mid' | 'ent' };
}

export interface ActiveFeature {
  id: string;
  title: string;
  description?: string;
  capabilities: string[];
  autonomyCap: number;
  defaultAutonomyCap?: number;
  usageCount: number;
  score: number;
  basis: string[];
}

export function getActiveFeatures(rr: RoleRegistry, uc: UserContext): ActiveFeature[] {
  const ctx = rr.getUserContext(uc.tenantId, uc.roleBinding);
  return ctx.features
    .map((feature: any) => {
      const usageCount = uc.workPatterns?.featureUseCount?.[feature.id] ?? 0;
      const cap = ctx.featureCaps[feature.id] ?? feature.autonomyCap ?? feature.defaultAutonomyCap ?? 3;
      const usageWeight = usageCount > 0 ? Math.log(usageCount + 1) : 0;
      const industryBoost = uc.orgContext?.industry && feature.id.includes(uc.orgContext.industry) ? 1 : 0;
      const score = cap + usageWeight + industryBoost;
      const basis = [
        `cap:${cap}`,
        `usage:${usageCount}`,
        ...(industryBoost ? [`boost:${uc.orgContext?.industry}`] : []),
      ];
      return {
        ...feature,
        autonomyCap: cap,
        usageCount,
        score,
        basis,
      } as ActiveFeature;
    })
    .sort((a, b) => b.score - a.score);
}
