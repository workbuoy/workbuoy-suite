import request from 'supertest';
import app from '../../src/server';
import { resetProactivityTelemetry } from '../../src/core/proactivity/telemetry';

describe('GET /api/explain/last', () => {
  beforeEach(() => resetProactivityTelemetry());

  it('returns last telemetry events', async () => {
    await request(app)
      .get('/api/proactivity/state')
      .set('x-tenant', 'TENANT')
      .set('x-user', 'user')
      .set('x-role', 'sales_rep')
      .set('x-proactivity', 'kraken');

    const res = await request(app).get('/api/explain/last');
    expect(res.status).toBe(200);
    expect(res.body.events[0].requestedKey).toBeDefined();
    expect(res.body.events[0].effectiveKey).toBeDefined();
  });
});
