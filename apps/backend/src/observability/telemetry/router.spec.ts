import express from 'express';
import request from 'supertest';

describe('observability telemetry router', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.TELEMETRY_ENABLED;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  async function setupApp() {
    const app = express();
    app.use(express.json());

    const { correlationHeader } = await import('../../../../../src/middleware/correlationHeader.js');
    app.use(correlationHeader);

    const {
      createTelemetryRouter,
      clearTelemetryExportHooks,
      registerTelemetryExportHook,
    } = await import('./router.js');

    clearTelemetryExportHooks();
    const hook = jest.fn();
    registerTelemetryExportHook(hook);
    app.set('telemetryHook', hook);

    app.use('/observability/telemetry', createTelemetryRouter());

    return app;
  }

  it('accepts telemetry exports when enabled and echoes trace id', async () => {
    process.env.TELEMETRY_ENABLED = 'true';
    const traceparent = '00-11111111111111111111111111111111-2222222222222222-01';

    const app = await setupApp();
    const hook: jest.Mock = app.get('telemetryHook');

    const response = await request(app)
      .post('/observability/telemetry/export')
      .set('Content-Type', 'application/json')
      .set('traceparent', traceparent)
      .send({ resourceSpans: [{ resource: { service: { name: 'test' } } }] });

    expect(response.status).toBe(202);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ accepted: 1 });
    expect(response.headers['trace-id']).toBe('11111111111111111111111111111111');
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith({
      resourceSpans: [{ resource: { service: { name: 'test' } } }],
    });
  });

  it('returns 404 when telemetry is disabled', async () => {
    process.env.TELEMETRY_ENABLED = 'false';

    const app = await setupApp();
    const response = await request(app)
      .post('/observability/telemetry/export')
      .set('Content-Type', 'application/json')
      .send({ resourceSpans: [{ resource: {} }] });

    expect(response.status).toBe(404);
    const hook: jest.Mock = app.get('telemetryHook');
    expect(hook).not.toHaveBeenCalled();
  });
});
