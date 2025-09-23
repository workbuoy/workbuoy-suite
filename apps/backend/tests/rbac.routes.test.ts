import request from 'supertest';
import app from '../src/app';

describe('RBAC admin routes', () => {
  test('upsert and delete bindings + deny override works', async () => {
    // list empty
    const list0 = await request(app).get('/api/v1/admin/rbac/bindings').set('x-tenant-id','t1');
    expect(list0.status).toBe(200);
    expect(Array.isArray(list0.body.items)).toBe(true);

    // create a deny binding for record kind -> should block even admin if effect=deny and matches
    const up = await request(app).post('/api/v1/admin/rbac/bindings').set('x-tenant-id','t1').send({
      user_id: 'uX',
      role: 'deny',
      effect: 'deny',
      resource: { kind: 'record' }
    });
    expect(up.status).toBe(201);

    // try to create as uX admin -> should be denied due to explicit deny
    const createDenied = await request(app).post('/api/v1/crm/contacts').set('x-tenant-id','t1').set('x-user-id','uX').set('x-roles','admin');
    expect(createDenied.status).toBe(403);

    // delete binding -> allow
    const del = await request(app).delete('/api/v1/admin/rbac/bindings/'+up.body.id).set('x-tenant-id','t1');
    expect(del.status).toBe(204);

    const createOk = await request(app).post('/api/v1/crm/contacts').set('x-tenant-id','t1').set('x-user-id','uX').set('x-roles','admin');
    expect(createOk.status).toBe(201);
  });
});
