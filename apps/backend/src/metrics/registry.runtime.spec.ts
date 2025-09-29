import express from 'express';
import request from 'supertest';

describe('metrics registry runtime behavior', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.METRICS_ENABLED;
    delete process.env.METRICS_PREFIX;
    delete process.env.METRICS_DEFAULT_LABELS;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns 204 when metrics are disabled via runtime flag', async () => {
    process.env.METRICS_ENABLED = 'false';

    const { resetRegistryForTests } = await import('./registry.js');
    resetRegistryForTests();

    const { createMetricsRouter } = await import('./router.js');
    const app = express();
    app.use('/metrics', createMetricsRouter());

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(204);
    expect(response.text).toBe('');

    const promClient = await import('prom-client');
    expect(promClient.collectDefaultMetrics).not.toHaveBeenCalled();
  });

  it('exposes prefixed metrics with default labels when enabled', async () => {
    process.env.METRICS_ENABLED = 'true';
    process.env.METRICS_PREFIX = 'wb_';
    process.env.METRICS_DEFAULT_LABELS = 'service=backend';

    const { resetRegistryForTests, getRegistry } = await import('./registry.js');
    resetRegistryForTests();
    const registry = getRegistry();

    const metricsSpy = jest
      .spyOn(registry, 'metrics')
      .mockResolvedValue([
        '# HELP wb_process_cpu_user_seconds_total CPU',
        '# TYPE wb_process_cpu_user_seconds_total counter',
        'wb_process_cpu_user_seconds_total{service="backend"} 1',
      ].join('\n'));

    const { createMetricsRouter } = await import('./router.js');
    const app = express();
    app.use('/metrics', createMetricsRouter());

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toContain('wb_process_cpu_user_seconds_total');
    expect(response.text).toContain('service="backend"');

    // Tillat flere default labels (service_name, version) – verifiser at 'service' finnes.
    expect(registry.setDefaultLabels).toHaveBeenCalledWith(
      expect.objectContaining({ service: 'backend' })
    );
    expect(metricsSpy).toHaveBeenCalled();

    const promClient = await import('prom-client');
    expect(promClient.collectDefaultMetrics).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: 'wb_', register: registry }),
    );
  });

  it('registers default metrics idempotently', async () => {
    process.env.METRICS_ENABLED = 'true';

    const { resetRegistryForTests, ensureDefaultNodeMetrics, getRegistry } = await import('./registry.js');
    resetRegistryForTests();

    await ensureDefaultNodeMetrics();
    const registry = getRegistry();
    const firstSnapshot = await registry.metrics();
    const firstHelpCount = (firstSnapshot.match(/# HELP/g) ?? []).length;

    await ensureDefaultNodeMetrics();
    const secondSnapshot = await registry.metrics();
    const secondHelpCount = (secondSnapshot.match(/# HELP/g) ?? []).length;

    const promClient = await import('prom-client');
    expect(promClient.collectDefaultMetrics).toHaveBeenCalledTimes(1);
    expect(firstHelpCount).toBeGreaterThan(0);
    expect(secondHelpCount).toBe(firstHelpCount);
  });
});
