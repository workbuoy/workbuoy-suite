import express from 'express';
import request from 'supertest';
import { createMetricsRouter, getRegistry, withMetrics } from '@workbuoy/backend-metrics';
import {
  startMetricsBridge,
  resetMetricsBridgeMetrics,
} from '../src/observability/metricsBridge';

describe('metricsBridge integration', () => {
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
    const registry = getRegistry();
    registry.resetMetrics();
  });

  test('events surface in /metrics output', async () => {
    const registry = getRegistry();
    const app = express();
    withMetrics(app, { registry, enableDefaultMetrics: false });
    app.use('/metrics', createMetricsRouter({ registry }));

    const bus = createStubBus();
    startMetricsBridge(bus as any);

    await bus.emit('rbac:denied', { role: 'contributor', resource: 'pipeline' });
    await bus.emit('telemetry:feature_used', { feature: 'automations', action: 'triggered' });

    const response = await request(app).get('/metrics').expect(200);
    expect(response.text).toMatch(/rbac_denied_total\{[^}]*role="contributor"/);
    expect(response.text).toMatch(/feature_usage_total\{[^}]*feature="automations"/);
  });
});
