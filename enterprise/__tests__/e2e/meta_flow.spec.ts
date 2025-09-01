import { test, expect } from '@playwright/test';
test('meta propose/approve/apply/rollback endpoints', async ({ request })=>{
  const p = await request.post('/api/meta/propose', { data: { change: 'test', rationale: 'demo' } });
  expect([200,401,403]).toContain(p.status());
  const a = await request.post('/api/meta/approve', { data: { id: 'p1' } });
  expect([200,401,403]).toContain(a.status());
  const ap = await request.post('/api/meta/apply', { data: { id: 'p1', patch: {} } });
  expect([200,401,403]).toContain(ap.status());
  const rb = await request.post('/api/meta/rollback', { data: {} });
  expect([200,401,403]).toContain(rb.status());
});
