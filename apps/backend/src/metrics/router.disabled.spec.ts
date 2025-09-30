import express from 'express';
import request from 'supertest';

describe('metrics router toggle', () => {
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

  it('responds with 200 and empty body when metrics are disabled', async () => {
    process.env.METRICS_ENABLED = 'false';

    const { resetRegistryForTests } = await import('./registry.js');
    resetRegistryForTests();

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

  it('responds with 200 when metrics are enabled', async () => {
    process.env.METRICS_ENABLED = 'true';

    const { resetRegistryForTests } = await import('./registry.js');
    resetRegistryForTests();

    const { createMetricsRouter } = await import('./router.js');
    const app = express();
    app.use('/metrics', createMetricsRouter());

    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
  });
});
