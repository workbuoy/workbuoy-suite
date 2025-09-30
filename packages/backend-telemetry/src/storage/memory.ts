import type { TelemetryEvent, TelemetryStorage } from '../types.js';

interface InMemoryUsageRecord extends TelemetryEvent {}

function normalizeEvent(event: TelemetryEvent): InMemoryUsageRecord {
  return {
    ...event,
    ts: new Date(event.ts),
  };
}

export function createInMemoryTelemetryStorage(): TelemetryStorage {
  const records: InMemoryUsageRecord[] = [];

  const storage: TelemetryStorage & {
    aggregateFeatureUseCount: (userId: string, tenantId?: string) => Promise<Record<string, number>>;
  } = {
    async record(event) {
      records.push(normalizeEvent(event));
    },
    async aggregateFeatureUseCount(userId: string, tenantId?: string) {
      return records
        .filter((record) => {
          if (record.userId !== userId) {
            return false;
          }
          if (!tenantId) {
            return true;
          }
          return record.tenantId === tenantId;
        })
        .reduce<Record<string, number>>((acc, record) => {
          acc[record.featureId] = (acc[record.featureId] ?? 0) + 1;
          return acc;
        }, {});
    },
  };

  return storage;
}
