import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('CRM MVP baseline', () => {
  const originalCwd = process.cwd();
  let app: any;
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-mvp-'));
    process.chdir(tmpDir);
    process.env.PERSIST_MODE = 'file';
    app = require('../../../src/server').default;
  });

  afterAll(() => {
    process.chdir(originalCwd);
    delete process.env.PERSIST_MODE;
  });

  it('rejects task writes without autonomy header', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'demo' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'E_POLICY_HEADERS_MISSING');
  });

  it('allows task write with autonomy level 2', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('x-autonomy-level', '2')
      .set('x-role', 'ops')
      .send({ title: 'demo' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'demo');
  });

  it('exposes bus stats shape', async () => {
    const res = await request(app).get('/_debug/bus');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      summary: expect.objectContaining({
        high: expect.any(Number),
        medium: expect.any(Number),
        low: expect.any(Number),
        dlq: expect.any(Number)
      }),
      queues: expect.any(Array),
      dlq: expect.any(Array)
    }));
  });

  it('exposes status payload', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      ok: true,
      ts: expect.any(String),
      persistMode: expect.any(String),
      queues: expect.objectContaining({
        high: expect.any(Number),
        medium: expect.any(Number),
        low: expect.any(Number),
        dlq: expect.any(Number)
      })
    }));
  });
});
