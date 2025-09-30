import request from 'supertest';

describe('observability logs router', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  async function buildTestApp() {
    const { buildApp } = await import('../../app.js');
    return buildApp();
  }

  it('accepts log payloads when enabled and propagates trace headers', async () => {
    process.env.LOGGING_ENABLED = 'true';
    process.env.TELEMETRY_ENABLED = 'false';

    const traceId = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const traceparent = `00-${traceId}-bbbbbbbbbbbbbbbb-01`;
    const app = await buildTestApp();

    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json')
      .set('traceparent', traceparent)
      .send({ level: 'info', message: 'hello world' });

    expect(response.status).toBe(202);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers['trace-id']).toBe(traceId);
    expect(response.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(new Date(response.body.receivedAt).toISOString()).toBe(response.body.receivedAt);
  });

  it('returns 400 for invalid payloads', async () => {
    process.env.LOGGING_ENABLED = 'true';

    const app = await buildTestApp();
    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json')
      .send({ level: 'debug', message: '' });

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toEqual({ error: 'invalid_payload' });
  });

  it('returns 404 when logging is disabled', async () => {
    process.env.LOGGING_ENABLED = 'false';

    const app = await buildTestApp();
    const response = await request(app)
      .post('/observability/logs/ingest')
      .set('Content-Type', 'application/json')
      .send({ level: 'info', message: 'noop' });

    expect(response.status).toBe(404);
  });
});
