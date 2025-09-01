import request from 'supertest';
import app from '../src/app';
import '../src/db/migrate';

const H = { 'x-tenant-id': 't1', 'x-user-role': 'admin' };

describe('CRM CRUD', () => {
  it('Contact create/list/get/patch/delete', async () => {
    const c1 = await request(app).post('/api/v1/crm/contacts').set(H).send({ name: 'Alice', email: 'a@a.com', custom_fields: { level: 3 } });
    expect(c1.status).toBe(201);
    const id = c1.body.id;

    const list = await request(app).get('/api/v1/crm/contacts?limit=10').set(H);
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(1);

    const get = await request(app).get('/api/v1/crm/contacts/'+id).set(H);
    expect(get.status).toBe(200);
    expect(get.body.custom_fields.level).toBe(3);

    const patch = await request(app).patch('/api/v1/crm/contacts/'+id).set(H).send({ phone: '123' });
    expect(patch.status).toBe(200);
    expect(patch.body.phone).toBe('123');

    const del = await request(app).delete('/api/v1/crm/contacts/'+id).set(H);
    expect(del.status).toBe(204);
  });

  it('Opportunity create & list', async () => {
    const o1 = await request(app).post('/api/v1/crm/opportunities').set(H).send({ title: 'Deal', amount: 1000 });
    expect(o1.status).toBe(201);
    const list = await request(app).get('/api/v1/crm/opportunities').set(H);
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(1);
  });
});
