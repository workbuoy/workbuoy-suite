import request from 'supertest';
import app from '../../src/server';

describe('Tasks routes', () => {
  it('GET tasks', async () => {
    const r = await request(app).get('/api/tasks').expect(200);
    expect(Array.isArray(r.body)).toBe(true);
  });
  it('POST task denied at autonomy 1', async () => {
    const r = await request(app)
      .post('/api/tasks')
      .set('x-autonomy-level', '1')
      .send({ title: 'Do thing' })
      .expect(403);
    expect(Array.isArray(r.body?.explanations)).toBe(true);
  });
  it('POST task allowed at autonomy 4', async () => {
    const r = await request(app)
      .post('/api/tasks')
      .set('x-autonomy-level', '4')
      .send({ title: 'Do thing' })
      .expect(201);
    expect(r.body?.title).toBe('Do thing');
  });
  it('PATCH task requires policy', async () => {
    const created = await request(app).post('/api/tasks').set('x-autonomy-level','4').send({ title:'x' }).expect(201);
    const id = created.body.id;
    await request(app).patch(`/api/tasks/${id}`).set('x-autonomy-level','1').send({ status:'done' }).expect(403);
  });
  it('DELETE task requires policy', async () => {
    const created = await request(app).post('/api/tasks').set('x-autonomy-level','4').send({ title:'y' }).expect(201);
    const id = created.body.id;
    await request(app).delete(`/api/tasks/${id}`).set('x-autonomy-level','1').expect(403);
    await request(app).delete(`/api/tasks/${id}`).set('x-autonomy-level','4').expect(204);
  });
});
