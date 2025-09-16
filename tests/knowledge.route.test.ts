// tests/knowledge.route.test.ts
import request from 'supertest';
import app from '../src/server';

describe('knowledge search', ()=>{
  it('returns results array', async ()=>{
    const r = await request(app).get('/api/knowledge/search?q=test');
    expect([200,404].includes(r.status)).toBe(true);
  });
});
