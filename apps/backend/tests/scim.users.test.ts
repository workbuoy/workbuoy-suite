import request from 'supertest';
import app from '../src/app';

const H = { Authorization: 'Bearer scim-dev-token', 'x-tenant-id': 't1' };

describe('SCIM Users', () => {
  it('CRUD + filter + pagination', async () => {
    // Create two users
    const u1 = await request(app).post('/scim/v2/Users').set(H).send({ userName: 'alice', displayName: 'Alice A' });
    expect(u1.status).toBe(201);
    const u2 = await request(app).post('/scim/v2/Users').set(H).send({ userName: 'bob', displayName: 'Bob B' });
    expect(u2.status).toBe(201);

    // Filter by userName eq "alice"
    const f = await request(app).get('/scim/v2/Users?filter=userName%20eq%20%22alice%22').set(H);
    expect(f.status).toBe(200);
    expect(f.body.totalResults).toBe(1);
    expect(f.body.Resources[0].userName).toBe('alice');

    // Pagination: create one more and list with count=2
    const u3 = await request(app).post('/scim/v2/Users').set(H).send({ userName: 'charlie', displayName: 'Charlie C' });
    expect(u3.status).toBe(201);
    const list2 = await request(app).get('/scim/v2/Users?startIndex=1&count=2').set(H);
    expect(list2.status).toBe(200);
    expect(list2.body.itemsPerPage).toBe(2);
    expect(list2.body.totalResults).toBeGreaterThanOrEqual(3);

    // PATCH: change displayName
    const patch = await request(app).patch('/scim/v2/Users/'+u1.body.id).set(H).send({ Operations: [{ op: 'replace', path: 'displayName', value: 'Alice AA' }] });
    expect(patch.status).toBe(200);
    expect(patch.body.displayName).toBe('Alice AA');

    // DELETE (deactivate)
    const del = await request(app).delete('/scim/v2/Users/'+u2.body.id).set(H);
    expect(del.status).toBe(204);
    const get2 = await request(app).get('/scim/v2/Users/'+u2.body.id).set(H);
    expect(get2.status).toBe(200);
    expect(get2.body.active).toBe(false);
  });
});
