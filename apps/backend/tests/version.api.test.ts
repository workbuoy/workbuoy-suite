import request from 'supertest';
import { app } from '../src/server.js';

describe('/api/version', () => {
  it('returns version and commit', async () => {
    const res = await request(app).get('/api/version');
    expect(res.status).toBe(200);
    expect(typeof res.body.version).toBe('string');
    expect(res.body.commit).toBeDefined();
    expect(typeof res.body.node).toBe('string');
  });
});
