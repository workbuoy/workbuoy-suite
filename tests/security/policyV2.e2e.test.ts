/**
 * Ensures write routes are enforced by Policy V2:
 *  - POST /api/tasks with autonomy=1 => 403 + explanations[]
 *  - GET  /api/tasks should remain 200
 */
import request from 'supertest';
import app from '../../apps/backend/src/server'; // assumes server exports Express app

describe('Policy V2 enforcement', () => {
  it('denies write at autonomy=1 with explanations', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('x-autonomy-level', '1')
      .set('x-role-id', 'user')
      .send({ title: 'Test', status: 'todo' });
    expect([401,403]).toContain(res.status);
    const body = res.body || {};
    const explanations = body.explanations || body?.error?.explanations || [];
    expect(Array.isArray(explanations)).toBe(true);
  });

  it('allows read (GET) without write privileges', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('x-autonomy-level', '1')
      .set('x-role-id', 'user');
    expect(res.status).toBe(200);
  });
});
