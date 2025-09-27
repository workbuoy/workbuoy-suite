import type { Counter } from 'prom-client';

describe('metrics bridge', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.METRICS_ENABLED = 'true';
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.METRICS_ENABLED;
    delete process.env.METRICS_PREFIX;
    delete process.env.METRICS_DEFAULT_LABELS;
    delete process.env.METRICS_BUCKETS;
  });

  it('increments RBAC and feature usage metrics when events fire', () => {
    jest.isolateModules(() => {
      const registry = require('./registry.js') as typeof import('./registry.js');
      registry.resetRegistryForTests();
      const bridge = require('./bridge.js') as typeof import('./bridge.js');
      const events = require('./events.js') as typeof import('./events.js');
      const metrics = require('./metrics.js') as typeof import('./metrics.js');

      bridge.resetMetricsBridgeForTest();
      bridge.initializeMetricsBridge();

      const deniedLabels = metrics.rbac_denied_total.labels as jest.MockedFunction<Counter<string>['labels']>;
      const featureLabels = metrics.feature_usage_total.labels as jest.MockedFunction<Counter<string>['labels']>;
      const policyInc = metrics.rbac_policy_change_total.inc as jest.Mock;

      events.metricsEvents.emit('rbac:denied', { resource: 'Pipeline ', action: 'Update Record' });
      events.metricsEvents.emit('telemetry:feature_used', { feature: 'Insights-Beta', action: 'OPEN' });
      events.metricsEvents.emit('rbac:policy_change', { op: 'upsert' });

      expect(deniedLabels).toHaveBeenCalledWith('pipeline', 'update_record');
      const deniedMetric = deniedLabels.mock.results.at(-1)?.value as { inc: jest.Mock } | undefined;
      expect(deniedMetric?.inc).toHaveBeenCalled();

      expect(featureLabels).toHaveBeenCalledWith('insights-beta', 'open');
      const featureMetric = featureLabels.mock.results.at(-1)?.value as { inc: jest.Mock } | undefined;
      expect(featureMetric?.inc).toHaveBeenCalled();

      expect(policyInc).toHaveBeenCalled();
    });
  });
});
