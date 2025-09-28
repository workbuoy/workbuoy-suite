import request from 'supertest';
import { app } from '../src/server.js';

describe('/api/version', () => {
  it('returns version and sha', async () => {
    const res = await request(app).get('/api/version');
    expect(res.status).toBe(200);
    expect(typeof res.body.version).toBe('string');
    expect(res.body.sha).toBeDefined();
  });
});
