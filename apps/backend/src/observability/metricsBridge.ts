import type { EventBus } from '../core/eventBusV2';
import { createCounter } from '@workbuoy/backend-metrics';
import { eventBus } from '../core/eventBusV2';

interface EventBusLike {
  on<T = any>(type: string, handler: (payload: T) => void | Promise<void>): void;
}

interface RbacDeniedPayload {
  role?: string | null;
  resource?: string | null;
}

interface FeatureUsedPayload {
  feature?: string | null;
  action?: string | null;
}

function normalizeLabel(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
}

const rbacDeniedCounter = createCounter({
  name: 'rbac_denied_total',
  help: 'Total RBAC denies observed on the event bus',
  labelNames: ['role', 'resource'] as const,
});

const featureUsageCounter = createCounter({
  name: 'feature_usage_total',
  help: 'Feature usage telemetry bridged onto the metrics registry',
  labelNames: ['feature', 'action'] as const,
});

const startedBuses = new WeakSet<object>();

export function startMetricsBridge(eventBus: EventBusLike = eventBus as EventBus): void {
  if (!eventBus || startedBuses.has(eventBus as object)) {
    return;
  }

  eventBus.on('rbac:denied', async (payload: RbacDeniedPayload = {}) => {
    const role = normalizeLabel(payload.role, 'unknown');
    const resource = normalizeLabel(payload.resource, 'unknown');
    rbacDeniedCounter.inc({ role, resource });
  });

  eventBus.on('telemetry:feature_used', async (payload: FeatureUsedPayload = {}) => {
    const feature = normalizeLabel(payload.feature, 'unknown');
    const action = normalizeLabel(payload.action, 'unknown');
    featureUsageCounter.inc({ feature, action });
  });

  startedBuses.add(eventBus as object);
}

export function resetMetricsBridgeMetrics(): void {
  rbacDeniedCounter.reset();
  featureUsageCounter.reset();
}

export { rbacDeniedCounter, featureUsageCounter };
