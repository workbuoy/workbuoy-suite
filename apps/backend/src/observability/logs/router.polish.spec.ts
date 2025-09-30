import express from 'express';
import request from 'supertest';

describe('observability logs router polish', () => {
  const ORIGINAL_ENV = process.env;
  const ORIGINAL_CONSOLE_LOG = console.log;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    console.log = jest.fn();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    console.log = ORIGINAL_CONSOLE_LOG;
  });

  async function buildApp() {
    const app = express();
    const { trace } = await import('../../middleware/trace.js');
    const { createLogsRouter } = await import('./router.js');

    app.use(trace);
    app.use(express.json());
    app.use('/observability/logs', createLogsRouter());

    return app;
  }

  it('produces structured logs with trace-derived reqId', async () => {
    process.env.LOGGING_ENABLED = 'true';

    const traceId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const traceparent = `00-${traceId}-bbbbbbbbbbbbbbbb-01`;
    const app = await buildApp();

    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json')
      .set('traceparent', traceparent)
      .send({ level: 'info', message: 'hello world' });

    expect(response.status).toBe(202);
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.receivedAt).toEqual(expect.any(String));

    expect(console.log).toHaveBeenCalledTimes(1);
    const [logLine] = (console.log as jest.Mock).mock.calls[0];
    const parsed = JSON.parse(logLine);

    expect(parsed).toEqual({
      level: 'info',
      message: 'hello world',
      ts: response.body.receivedAt,
      reqId: traceId,
    });
  });

  it('generates a reqId when none is provided', async () => {
    process.env.LOGGING_ENABLED = 'true';

    const app = await buildApp();

    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json')
      .send({ level: 'warn', message: 'missing trace' });

    expect(response.status).toBe(202);
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.receivedAt).toEqual(expect.any(String));

    expect(console.log).toHaveBeenCalledTimes(1);
    const [logLine] = (console.log as jest.Mock).mock.calls[0];
    const parsed = JSON.parse(logLine);

    expect(parsed.level).toBe('warn');
    expect(parsed.message).toBe('missing trace');
    expect(parsed.ts).toBe(response.body.receivedAt);
    expect(parsed.reqId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
