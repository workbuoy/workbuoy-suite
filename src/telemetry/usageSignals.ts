import { createInMemoryTelemetryStorage } from '@workbuoy/backend-telemetry';
import type { TelemetryEvent } from '@workbuoy/backend-telemetry';

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

const store = createInMemoryTelemetryStorage();

function toFeatureUsageEvent(event: FeatureUsage): TelemetryEvent {
  return {
    userId: event.userId,
    tenantId: event.tenantId ?? 'DEV',
    featureId: event.featureId,
    action: event.action,
    ts: event.ts ? new Date(event.ts) : new Date(),
  };
}

/**
 * @deprecated Use createInMemoryTelemetryStorage().record instead.
 */
export function recordFeatureUsage(event: FeatureUsage): void {
  void store.record(toFeatureUsageEvent(event));
}

/**
 * @deprecated Use createInMemoryTelemetryStorage().aggregateFeatureUseCount instead.
 */
export function aggregateFeatureUseCount(
  userId: string,
  tenantId?: string,
): Record<string, number> {
  const aggregate = (store as any).aggregateFeatureUseCount;
  if (typeof aggregate === 'function') {
    return aggregate.call(store, userId, tenantId);
  }
  return {};
}
