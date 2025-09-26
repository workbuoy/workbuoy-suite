import type { FeatureUsageEvent, TelemetryStore } from '../types.js';

interface InMemoryUsageRecord extends FeatureUsageEvent {
  ts: Date;
}

function normalizeEvent(event: FeatureUsageEvent): InMemoryUsageRecord {
  return {
    ...event,
    ts: event.ts ? new Date(event.ts) : new Date(),
  };
}

export function createInMemoryTelemetryStore(): TelemetryStore {
  const records: InMemoryUsageRecord[] = [];

  return {
    recordFeatureUsage(event) {
      records.push(normalizeEvent(event));
    },
    aggregateFeatureUseCount(userId, tenantId) {
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
}
