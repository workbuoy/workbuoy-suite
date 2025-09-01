const request = require('supertest');
const app = require('../examples/server');

describe('DSR API', () => {
  it('fulfills access request', async () => {
    const res = await request(app).post('/api/secure/dsr/access').send({ user_email: 'alice@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.export).toBeTruthy();
    expect(res.body.request_id).toBeTruthy();
  });

  it('performs soft erasure', async () => {
    const res = await request(app).post('/api/secure/dsr/erasure').send({ user_email: 'alice@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe('soft-deleted');
  });

  it('rectifies allowed fields only', async () => {
    const res = await request(app).post('/api/secure/dsr/rectification').send({
      user_email: 'alice@example.com',
      updates: { name: 'Alice', forbidden_field: 'x' }
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.updated).toContain('name');
    expect(res.body.updated).not.toContain('forbidden_field');
  });

  it('records consent change', async () => {
    const res = await request(app).post('/api/secure/dsr/consent').send({
      user_email: 'alice@example.com',
      action: 'given',
      metadata: { checkbox: true }
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.logged).toBe(true);
  });
});
