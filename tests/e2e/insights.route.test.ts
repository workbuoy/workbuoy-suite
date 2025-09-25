import request from 'supertest';
import app from '../../apps/backend/src/server'; // assumes server exports app (PR4b)

describe('GET /api/insights', () => {
  it('returns at least one credit_review_recommended card for mock data', async () => {
    const res = await request(app).get('/api/insights').expect(200);
    const items = res.body?.items || [];
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((c:any) => c.kind === 'credit_review_recommended')).toBe(true);
  });
});
