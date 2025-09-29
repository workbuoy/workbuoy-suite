import express from 'express';
import request from 'supertest';

describe('observability logs router', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.LOGGING_ENABLED;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  async function setupApp() {
    const app = express();
    app.use(express.json());

    const { correlationHeader } = await import('../../../../../src/middleware/correlationHeader.js');
    app.use(correlationHeader);

    const { createLogsRouter, clearLogIngestHooks, registerLogIngestHook } = await import('./router.js');

    clearLogIngestHooks();
    const hook = jest.fn();
    registerLogIngestHook(hook);
    app.set('logHook', hook);

    app.use('/observability/logs', createLogsRouter());

    return app;
  }

  it('accepts log payloads when enabled', async () => {
    process.env.LOGGING_ENABLED = 'true';
    const traceparent = '00-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01';

    const app = await setupApp();
    const hook: jest.Mock = app.get('logHook');

    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('traceparent', traceparent)
      .send({ level: 'info', message: 'hello world' });

    expect(response.status).toBe(202);
    expect(response.headers['content-type']).toContain('application/json; charset=utf-8');
    expect(response.body.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(new Date(response.body.receivedAt).toString()).not.toBe('Invalid Date');
    expect(response.headers['trace-id']).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith({ level: 'info', message: 'hello world' });
  });

  it('rejects invalid payloads with 400', async () => {
    process.env.LOGGING_ENABLED = 'true';

    const app = await setupApp();
    const hook: jest.Mock = app.get('logHook');

    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ level: 'debug', message: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('invalid_payload');
    expect(hook).not.toHaveBeenCalled();
  });

  it('returns 404 when logging is disabled', async () => {
    process.env.LOGGING_ENABLED = 'false';

    const app = await setupApp();
    const hook: jest.Mock = app.get('logHook');

    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ level: 'info', message: 'noop' });

    expect(response.status).toBe(404);
    expect(hook).not.toHaveBeenCalled();
  });
});
