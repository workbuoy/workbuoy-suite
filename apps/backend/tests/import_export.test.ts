import request from 'supertest';
import app from '../src/app';
import '../src/db/migrate';

const H = { 'x-tenant-id': 't1', 'x-user-role': 'admin' };

describe('Import/Export', () => {
  it('JSON import & export contacts', async () => {
    const imp = await request(app).post('/api/v1/crm/import').set(H).set('Content-Type','application/json')
      .send({ entity:'contacts', items: [{ name:'C1' }, { name:'C2' }] });
    expect(imp.status).toBe(200);
    expect(imp.body.imported).toBe(2);

    const exp = await request(app).get('/api/v1/crm/export?entity=contacts').set(H);
    expect(exp.status).toBe(200);
    expect(exp.body.items.length).toBeGreaterThanOrEqual(2);
  });
});
