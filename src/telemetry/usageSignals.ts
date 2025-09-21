export interface FeatureUsage { userId: string; tenantId?: string; featureId: string; ts: string; action: 'open'|'complete'|'dismiss'; }
const store: FeatureUsage[] = [];
export function recordFeatureUsage(evt: FeatureUsage) { store.push(evt); }
export function aggregateFeatureUseCount(userId: string, tenantId?: string) {
  return store
    .filter(e => e.userId === userId && (!tenantId || e.tenantId === tenantId))
    .reduce((acc,e)=>{ acc[e.featureId]=(acc[e.featureId]||0)+1; return acc; }, {} as Record<string,number>);
}
