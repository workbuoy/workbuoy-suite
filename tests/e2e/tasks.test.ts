import request from 'supertest';
import app from '../../apps/backend/src/server';

describe('Tasks', () => {
  it('CRUD with policy', async ()=>{
    const c = await request(app).post('/api/tasks').set('x-autonomy-level','2').send({ title:'T1' });
    expect(c.status).toBe(201); const id = c.body.id;
    const u = await request(app).patch('/api/tasks/'+id).set('x-autonomy-level','2').send({ status:'doing' });
    expect(u.status).toBe(200);
    const d = await request(app).delete('/api/tasks/'+id).set('x-autonomy-level','2');
    expect([204,200]).toContain(d.status);
  });
});
