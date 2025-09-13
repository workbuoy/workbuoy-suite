import request from 'supertest';
import app from '../../src/server';

describe('CRM contacts', () => {
  it('create requires autonomy >=2', async ()=>{
    const r = await request(app).post('/api/crm/contacts').set('x-autonomy-level','1').send({ name:'Acme' });
    expect([401,403]).toContain(r.status);
  });
  it('create + list + delete (autonomy=2)', async ()=>{
    const c = await request(app).post('/api/crm/contacts').set('x-autonomy-level','2').send({ name:'Acme' });
    expect(c.status).toBe(201);
    const id = c.body.id;
    const l = await request(app).get('/api/crm/contacts'); expect(l.status).toBe(200);
    const d = await request(app).delete('/api/crm/contacts/'+id).set('x-autonomy-level','2');
    expect([204,200]).toContain(d.status);
  });
});
