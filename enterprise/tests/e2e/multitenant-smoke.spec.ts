import { test, expect, request } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function magicLogin(email: string) {
  // dev helper: create a fake magic token inline
  const token = Buffer.from(JSON.stringify({ email, tenant_id: email.split('@')[1].split('.')[0] || 't' })).toString('base64') + '.sig';
  return { token };
}

test('T1 and T2 isolation and metrics', async ({ }) => {
  const t1 = 't1';
  const t2 = 't2';
  const user1 = 'owner@t1.example.com';
  const user2 = 'owner@t2.example.com';

  const { token: tok1 } = await magicLogin(user1);
  const { token: tok2 } = await magicLogin(user2);

  const api = await request.newContext();

  // Seed T1 tickets
  for (let i=0;i<3;i++) {
    const r = await api.post(`${BASE}/pages/api/ai/tool/ticket`, {
      headers: { authorization: `Bearer ${tok1}`, 'x-tenant-id': t1 },
      data: { title: `Ticket T1 #${i}`, body: 'Hello' }
    });
    expect(r.status()).toBeLessThan(500);
  }

  // Verify T1 sees own data
  const r1 = await api.get(`${BASE}/pages/api/tickets`, {
    headers: { authorization: `Bearer ${tok1}`, 'x-tenant-id': t1 }
  });
  expect(r1.status()).toBe(200);
  const t1Tickets = await r1.json();
  expect(Array.isArray(t1Tickets)).toBeTruthy();
  expect(t1Tickets.find((x:any)=>/T1/.test(x.title))).toBeTruthy();

  // Verify T2 does NOT see T1 data
  const r2 = await api.get(`${BASE}/pages/api/tickets`, {
    headers: { authorization: `Bearer ${tok2}`, 'x-tenant-id': t2 }
  });
  expect(r2.status()).toBe(200);
  const t2Tickets = await r2.json();
  expect(t2Tickets.find((x:any)=>/T1/.test(x.title))).toBeFalsy();

  // Hit search and AI to emit metrics with tenant labels
  await api.get(`${BASE}/pages/api/search?tenant=${t1}&q=hello`, { headers: { authorization: `Bearer ${tok1}` } });
  await api.get(`${BASE}/pages/api/search?tenant=${t2}&q=hello`, { headers: { authorization: `Bearer ${tok2}` } });

  const metricsResp = await api.get(`${BASE}/pages/api/metrics`);
  const body = await metricsResp.text();
  expect(body).toContain('wb_search_req_by_tenant_total{tenant="t1"}');
  expect(body).toContain('wb_search_req_by_tenant_total{tenant="t2"}');
});
