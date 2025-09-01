import request from 'supertest';
import app from '../src/app';

describe('CRM Opportunities', () => {
  it('returns list (unauthenticated blocked)', async () => {
    const res = await request(app).get('/api/v1/crm/opportunities');
    expect(res.status).toBe(401);
  });
});
