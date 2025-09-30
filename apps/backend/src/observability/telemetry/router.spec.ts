import request from 'supertest';

describe('observability telemetry router', () => {
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

  it('accepts telemetry exports when enabled and includes trace headers', async () => {
    process.env.TELEMETRY_ENABLED = 'true';
    process.env.LOGGING_ENABLED = 'false';

    const traceId = '11111111111111111111111111111111';
    const traceparent = `00-${traceId}-2222222222222222-01`;
    const app = await buildTestApp();

    const response = await request(app)
      .post('/observability/telemetry/export')
      .set('Content-Type', 'application/json')
      .set('traceparent', traceparent)
      .send({ resourceSpans: [{}] });

    expect(response.status).toBe(202);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toEqual({ accepted: 1 });
    expect(response.headers['trace-id']).toBe(traceId);
  });

  it('returns 400 for invalid payloads', async () => {
    process.env.TELEMETRY_ENABLED = 'true';

    const app = await buildTestApp();
    const response = await request(app)
      .post('/observability/telemetry/export')
      .set('Content-Type', 'application/json')
      .send({});

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.body).toEqual({ error: 'invalid_payload' });
  });

  it('returns 404 when telemetry is disabled', async () => {
    process.env.TELEMETRY_ENABLED = 'false';

    const app = await buildTestApp();
    const response = await request(app)
      .post('/observability/telemetry/export')
      .set('Content-Type', 'application/json')
      .send({ resourceSpans: [{}] });

    expect(response.status).toBe(404);
  });
});
