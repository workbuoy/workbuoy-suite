// tests/contracts/basic.contract.test.ts
import request from 'supertest';
import app from '../../apps/backend/src/server';
describe('contracts',()=>{
  it('tasks returns array', async()=>{
    const r = await request(app).get('/api/tasks');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
  });
});
