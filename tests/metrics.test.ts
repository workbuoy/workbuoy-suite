// tests/metrics.test.ts
import request from 'supertest';
import app from '../src/server';
describe('metrics', ()=>{
  it('returns prometheus text', async ()=>{
    const r = await request(app).get('/metrics');
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toMatch(/text\/plain/);
    expect(r.text).toContain('eventbus_queue_high');
    expect(r.text).toContain('eventbus_queue_med');
    expect(r.text).toContain('eventbus_queue_low');
    expect(r.text).toContain('eventbus_dlq_size');
  });
});
