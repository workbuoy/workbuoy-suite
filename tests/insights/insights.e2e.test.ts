import request from 'supertest';
// Note: your repo should export the Express app from src/server
import app from '../../src/server';

describe('Insights API', () => {
  it('GET /api/insights returns items[]', async () => {
    const r = await request(app).get('/api/insights').expect(200);
    expect(Array.isArray(r.body?.items)).toBe(true);
  });
});
