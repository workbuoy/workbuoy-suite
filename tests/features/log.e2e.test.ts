import request from 'supertest';
import app from '../../apps/backend/src/server';

describe('Log routes', () => {
  it('GET logs', async () => {
    const r = await request(app).get('/api/logs').expect(200);
    expect(Array.isArray(r.body)).toBe(true);
  });
  it('POST log denied at autonomy 1', async () => {
    const r = await request(app)
      .post('/api/logs')
      .set('x-autonomy-level', '1')
      .send({ level:'info', message:'hello' })
      .expect(403);
    expect(Array.isArray(r.body?.explanations)).toBe(true);
  });
  it('POST log ok at autonomy 4', async () => {
    const r = await request(app)
      .post('/api/logs')
      .set('x-autonomy-level', '4')
      .send({ level:'info', message:'hello' })
      .expect(201);
    expect(r.body?.message).toBe('hello');
    expect(r.body?.id).toBeTruthy();
  });
});
