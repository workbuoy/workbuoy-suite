import request from 'supertest';
import app from '../../apps/backend/src/server';

describe('CRM routes', () => {
  it('GET contacts', async () => {
    const r = await request(app).get('/api/crm/contacts').expect(200);
    expect(Array.isArray(r.body)).toBe(true);
  });
  it('POST contact denied at autonomy 1', async () => {
    const r = await request(app)
      .post('/api/crm/contacts')
      .set('x-autonomy-level', '1')
      .send({ name: 'ACME' })
      .expect(403);
    expect(Array.isArray(r.body?.explanations)).toBe(true);
  });
  it('POST contact allowed at autonomy 4', async () => {
    const r = await request(app)
      .post('/api/crm/contacts')
      .set('x-autonomy-level', '4')
      .send({ name: 'ACME' })
      .expect(201);
    expect(r.body?.name).toBe('ACME');
  });
});
