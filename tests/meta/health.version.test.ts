import express from 'express';
import request from 'supertest';

import router from '../../apps/backend/meta/router';

describe('META: /meta/health and /meta/version', () => {
  const app = express();
  app.use('/api/meta', router);

  it('GET /meta/health -> 200 and shape', async () => {
    const r = await request(app).get('/api/meta/health');
    expect(r.status).toBe(200);
    expect(['ok', 'degraded', 'down']).toContain(r.body.status);
    expect(typeof r.body.uptime_s).toBe('number');
    expect(r.body).toHaveProperty('git_sha');
    expect(r.body).toHaveProperty('started_at');
  });

  it('GET /meta/version -> 200 and shape', async () => {
    const r = await request(app).get('/api/meta/version');
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty('semver');
    expect(r.body).toHaveProperty('git_sha');
    expect(r.body).toHaveProperty('built_at');
  });

  it('health uptime increases between calls', async () => {
    const r1 = await request(app).get('/api/meta/health');
    await new Promise((res) => setTimeout(res, 50));
    const r2 = await request(app).get('/api/meta/health');
    expect(r2.body.uptime_s).toBeGreaterThanOrEqual(r1.body.uptime_s);
  });
});
