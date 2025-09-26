import {
  startMetricsBridge,
  resetMetricsBridgeMetrics,
  rbacDeniedCounter,
  featureUsageCounter,
} from '../src/observability/metricsBridge';

describe('metricsBridge', () => {
  function createStubBus() {
    const handlers = new Map<string, (payload: any) => Promise<void> | void>();
    return {
      on(type: string, handler: (payload: any) => Promise<void> | void) {
        handlers.set(type, handler);
      },
      async emit(type: string, payload: any) {
        const handler = handlers.get(type);
        if (handler) {
          await handler(payload);
        }
      },
    };
  }

  beforeEach(() => {
    resetMetricsBridgeMetrics();
  });

  test('increments RBAC denied counter with normalized labels', async () => {
    const bus = createStubBus();
    startMetricsBridge(bus as any);

    await bus.emit('rbac:denied', { role: 'viewer', resource: 'reports' });
    await bus.emit('rbac:denied', { role: 'viewer', resource: 'reports' });
    await bus.emit('rbac:denied', { role: null, resource: '' });

    const snapshot = await rbacDeniedCounter.get();
    const values = snapshot.values.reduce<Record<string, number>>((acc, sample) => {
      const role = sample.labels.role as string;
      const resource = sample.labels.resource as string;
      acc[`${role}:${resource}`] = sample.value;
      return acc;
    }, {});

    expect(values['viewer:reports']).toBe(2);
    expect(values['unknown:unknown']).toBe(1);
  });

  test('increments feature usage counter on telemetry events', async () => {
    const bus = createStubBus();
    startMetricsBridge(bus as any);

    await bus.emit('telemetry:feature_used', { feature: 'insights', action: 'viewed' });
    await bus.emit('telemetry:feature_used', { feature: 'insights', action: 'viewed' });
    await bus.emit('telemetry:feature_used', { feature: 'automation', action: undefined });

    const snapshot = await featureUsageCounter.get();
    const values = snapshot.values.reduce<Record<string, number>>((acc, sample) => {
      const feature = sample.labels.feature as string;
      const action = sample.labels.action as string;
      acc[`${feature}:${action}`] = sample.value;
      return acc;
    }, {});

    expect(values['insights:viewed']).toBe(2);
    expect(values['automation:unknown']).toBe(1);
  });
});
