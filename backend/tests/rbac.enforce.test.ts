import request from 'supertest';
import app from '../src/app';

describe('RBAC enforcement', () => {
  test('viewer can read but not create', async () => {
    const r1 = await request(app).get('/api/v1/crm/contacts/abc').set('x-tenant-id','t1').set('x-roles','viewer');
    expect(r1.status).toBe(200);
    const r2 = await request(app).post('/api/v1/crm/contacts').set('x-tenant-id','t1').set('x-roles','viewer');
    expect(r2.status).toBe(403);
  });

  test('contributor can create but can only update own', async () => {
    const create = await request(app).post('/api/v1/crm/contacts').set('x-tenant-id','t1').set('x-user-id','u1').set('x-roles','contributor');
    expect(create.status).toBe(201);
    const id = create.body.id;
    const patchOwn = await request(app).patch('/api/v1/crm/contacts/'+id).set('x-tenant-id','t1').set('x-user-id','u1').set('x-roles','contributor').set('x-owner-id','u1');
    expect(patchOwn.status).toBe(200);
    const patchOther = await request(app).patch('/api/v1/crm/contacts/'+id).set('x-tenant-id','t1').set('x-user-id','u2').set('x-roles','contributor').set('x-owner-id','u1');
    expect(patchOther.status).toBe(403);
  });

  test('manager can create and update, but not delete', async () => {
    const create = await request(app).post('/api/v1/crm/contacts').set('x-tenant-id','t1').set('x-roles','manager');
    expect(create.status).toBe(201);
    const id = create.body.id;
    const patch = await request(app).patch('/api/v1/crm/contacts/'+id).set('x-tenant-id','t1').set('x-roles','manager').set('x-owner-id','u9');
    expect(patch.status).toBe(200);
    const del = await request(app).delete('/api/v1/crm/contacts/'+id).set('x-tenant-id','t1').set('x-roles','manager');
    expect(del.status).toBe(403);
  });

  test('admin can delete', async () => {
    const create = await request(app).post('/api/v1/crm/contacts').set('x-tenant-id','t1').set('x-roles','admin');
    const id = create.body.id;
    const del = await request(app).delete('/api/v1/crm/contacts/'+id).set('x-tenant-id','t1').set('x-roles','admin');
    expect(del.status).toBe(204);
  });
});
