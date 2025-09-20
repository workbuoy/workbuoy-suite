import { persistenceEnabled } from '../core/config/dbFlag';
import { aggregateFeatureUseCountDb, recordFeatureUsageDb } from './usageSignals.db';

export interface FeatureUsage {
  id?: string;
  tenantId?: string;
  userId: string;
  featureId: string;
  ts?: string;
  action: 'open' | 'complete' | 'dismiss';
  metadata?: Record<string, any>;
}

const memoryStore: FeatureUsage[] = [];

export async function recordFeatureUsage(evt: FeatureUsage): Promise<void> {
  if (persistenceEnabled()) {
    await recordFeatureUsageDb(evt);
    return;
  }
  memoryStore.push({ ...evt, ts: evt.ts ?? new Date().toISOString() });
}

export async function aggregateFeatureUseCount(userId: string, tenantId?: string): Promise<Record<string, number>> {
  if (persistenceEnabled()) {
    return aggregateFeatureUseCountDb(userId, tenantId);
  }
  return memoryStore
    .filter(e => e.userId === userId && (!tenantId || e.tenantId === tenantId))
    .reduce((acc, e) => {
      acc[e.featureId] = (acc[e.featureId] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
}

export function resetUsageStore() {
  memoryStore.length = 0;
}
