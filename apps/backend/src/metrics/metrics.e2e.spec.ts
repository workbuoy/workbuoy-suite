import express from 'express';
import request from 'supertest';

describe('metrics exposure', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.METRICS_ENABLED;
    delete process.env.METRICS_PREFIX;
    delete process.env.METRICS_DEFAULT_LABELS;
    delete process.env.METRICS_BUCKETS;
  });

  it('responds with 204 when metrics are disabled', async () => {
    const app = express();
    const { resetRegistryForTests } = await import('./registry.js');
    resetRegistryForTests();

    const { createMetricsRouter } = await import('./router.js');
    app.use('/metrics', createMetricsRouter());

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(204);
    expect(response.text).toBe('');

    const promClient = await import('prom-client');
    expect(promClient.collectDefaultMetrics).not.toHaveBeenCalled();
  });

  it('registers default metrics once when enabled', async () => {
    process.env.METRICS_ENABLED = 'true';
    const app = express();

    const { resetRegistryForTests, getRegistry } = await import('./registry.js');
    resetRegistryForTests();

    const { createMetricsRouter } = await import('./router.js');
    app.use('/metrics', createMetricsRouter());

    const firstResponse = await request(app).get('/metrics');
    expect(firstResponse.status).toBe(200);
    expect(firstResponse.headers['content-type']).toContain('text/plain');

    const registry = getRegistry();
    const snapshotAfterFirst = await registry.metrics();
    const helpCountAfterFirst = (snapshotAfterFirst.match(/# HELP/g) ?? []).length;

    const secondResponse = await request(app).get('/metrics');
    expect(secondResponse.status).toBe(200);

    const promClient = await import('prom-client');
    expect(promClient.collectDefaultMetrics).toHaveBeenCalledTimes(1);

    const snapshotAfterSecond = await registry.metrics();
    const helpCountAfterSecond = (snapshotAfterSecond.match(/# HELP/g) ?? []).length;

    expect(helpCountAfterSecond).toBe(helpCountAfterFirst);
  });

  it('exposes RBAC and feature usage metrics when enabled', async () => {
    process.env.METRICS_ENABLED = 'true';
    const app = express();

    const { resetRegistryForTests } = await import('./registry.js');
    resetRegistryForTests();

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
