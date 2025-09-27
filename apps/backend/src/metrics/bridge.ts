import { metricsEvents } from './events.js';
import { isMetricsEnabled } from '../observability/metricsConfig.js';
import {
  feature_usage_total,
  rbac_denied_total,
  rbac_policy_change_total,
} from './metrics.js';

function sanitizeLabel(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  return normalized.replace(/[^a-z0-9:_-]/gi, '_');
}

let initialized = false;

export function initializeMetricsBridge(): void {
  if (initialized || !isMetricsEnabled()) {
    return;
  }

  initialized = true;

  metricsEvents.on('rbac:denied', (event) => {
    const resource = sanitizeLabel(event.resource, 'unknown');
    const action = sanitizeLabel(event.action, 'unknown');
    rbac_denied_total.labels(resource, action).inc();
  });

  metricsEvents.on('rbac:policy_change', () => {
    rbac_policy_change_total.inc();
  });

  metricsEvents.on('telemetry:feature_used', (event) => {
    const feature = sanitizeLabel(event.feature, 'unknown');
    const action = sanitizeLabel(event.action, 'unknown');
    feature_usage_total.labels(feature, action).inc();
  });
}

export function resetMetricsBridgeForTest(): void {
  initialized = false;
  metricsEvents.removeAllListeners('rbac:denied');
  metricsEvents.removeAllListeners('rbac:policy_change');
  metricsEvents.removeAllListeners('telemetry:feature_used');
}
