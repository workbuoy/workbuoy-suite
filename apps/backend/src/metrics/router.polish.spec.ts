import express from 'express';
import request from 'supertest';

describe('metrics router polish', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.METRICS_ENABLED;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  async function loadBackendVersion() {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const thisFilePath = fileURLToPath(import.meta.url);
    const metricsDir = dirname(thisFilePath);
    const srcDir = dirname(metricsDir);
    const backendRoot = dirname(srcDir);
    const packageJsonPath = join(backendRoot, 'package.json');
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version?: string };
    return pkg.version ?? 'dev';
  }

  it('exposes prometheus text with service/version labels and explicit content-type', async () => {
    process.env.METRICS_ENABLED = 'true';

    const { resetRegistryForTests, getRegistry } = await import('./registry.js');
    resetRegistryForTests();
    const registry = getRegistry();

    const version = await loadBackendVersion();
    const metricsSpy = jest
      .spyOn(registry, 'metrics')
      .mockResolvedValue(
        [
          '# HELP wb_process_cpu_user_seconds_total CPU',
          '# TYPE wb_process_cpu_user_seconds_total counter',
          `wb_process_cpu_user_seconds_total{service="backend",version="${version}"} 1`,
        ].join('\n'),
      );

    const { createMetricsRouter } = await import('./router.js');
    const app = express();
    app.use('/metrics', createMetricsRouter());

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.headers['content-type']).toContain('version=0.0.4');
    expect(response.headers['content-type']).toContain('charset=utf-8');
    expect(response.text).toContain('service="backend"');
    expect(response.text).toContain(`version="${version}"`);
    expect(metricsSpy).toHaveBeenCalled();
  });

  it('returns an empty body when the registry has no metrics', async () => {
    process.env.METRICS_ENABLED = 'true';

    const { resetRegistryForTests, getRegistry } = await import('./registry.js');
    resetRegistryForTests();
    const registry = getRegistry();

    jest.spyOn(registry, 'metrics').mockResolvedValue('\n  \n');

    const { createMetricsRouter } = await import('./router.js');
    const app = express();
    app.use('/metrics', createMetricsRouter());

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.headers['content-type']).toContain('version=0.0.4');
    expect(response.headers['content-type']).toContain('charset=utf-8');
    expect(response.text).toBe('');
  });
});
