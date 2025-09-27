import express from 'express';
import request from 'supertest';

describe('metrics exposure', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.METRICS_ENABLED = 'true';
  });

  afterEach(() => {
    delete process.env.METRICS_ENABLED;
  });

  it('exposes RBAC and feature usage metrics when enabled', async () => {
    const app = express();
    const { initializeMetricsBridge } = await import('./bridge.js');
    const { createMetricsRouter } = await import('./router.js');
    const { metricsEvents } = await import('./events.js');

    initializeMetricsBridge();
    app.use('/metrics', createMetricsRouter());

    metricsEvents.emit('rbac:denied', { resource: 'Record', action: 'DELETE' });
    metricsEvents.emit('telemetry:feature_used', { feature: 'insights', action: 'open' });

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toMatch(/rbac_denied_total/);
    expect(response.text).toMatch(/feature_usage_total/);
  });
});
