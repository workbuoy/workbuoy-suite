import request from 'supertest';
import { app } from '../src/server.js';

const withEnv = (key: string, value: string | undefined, fn: () => Promise<void>) => {
  const prev = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
  return fn().finally(() => {
    if (prev === undefined) delete process.env[key];
    else process.env[key] = prev;
  });
};

describe('/api/ready', () => {
  it('returns 200 when ready', async () => {
    await withEnv('WB_CHAOS_READY', undefined, async () => {
      const res = await request(app).get('/api/ready');
      expect(res.status).toBe(200);
      expect(res.body.ready).toBe(true);
    });
  });

  it('returns 503 when chaos flag is set', async () => {
    await withEnv('WB_CHAOS_READY', '1', async () => {
      const res = await request(app).get('/api/ready');
      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({ ready: false, reason: 'chaos' });
    });
  });
});
