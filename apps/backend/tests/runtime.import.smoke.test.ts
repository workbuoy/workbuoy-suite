// Ensures the app boots without ESM import errors (e.g., express named exports at runtime)
import request from 'supertest';
import { app } from '../src/server.js';

describe('runtime import smoke', () => {
  it('boots and responds on /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
