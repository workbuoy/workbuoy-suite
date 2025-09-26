import { createInMemoryTelemetryStore } from '@workbuoy/backend-telemetry';
import type { FeatureUsageEvent } from '@workbuoy/backend-telemetry';

/**
 * @deprecated Use @workbuoy/backend-telemetry instead.
 */
export interface FeatureUsage {
  userId: string;
  tenantId?: string;
  featureId: string;
  ts: string;
  action: 'open' | 'complete' | 'dismiss';
}

const store = createInMemoryTelemetryStore();

function toFeatureUsageEvent(event: FeatureUsage): FeatureUsageEvent {
  return {
    userId: event.userId,
    tenantId: event.tenantId,
    featureId: event.featureId,
    action: event.action,
    ts: event.ts ? new Date(event.ts) : undefined,
  };
}

/**
 * @deprecated Use createInMemoryTelemetryStore().recordFeatureUsage instead.
 */
export function recordFeatureUsage(event: FeatureUsage): void {
  store.recordFeatureUsage(toFeatureUsageEvent(event));
}

/**
 * @deprecated Use createInMemoryTelemetryStore().aggregateFeatureUseCount instead.
 */
export function aggregateFeatureUseCount(
  userId: string,
  tenantId?: string,
): Record<string, number> {
  return store.aggregateFeatureUseCount(userId, tenantId);
}
