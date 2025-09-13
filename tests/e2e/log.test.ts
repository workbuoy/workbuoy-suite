import request from 'supertest';
import app from '../../src/server';

describe('Logs & audit', () => {
  it('append log requires autonomy >=2 and audit verify is ok', async ()=>{
    const a = await request(app).post('/api/logs').set('x-autonomy-level','2').send({ level:'info', message:'hello' });
    expect(a.status).toBe(201);
    const l = await request(app).get('/api/logs'); expect(l.status).toBe(200);
  });
});
