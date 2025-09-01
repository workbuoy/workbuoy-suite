/* @jest-environment node */
import rateLimit from '../../lib/middleware/tenant-rate-limit.js';

function call(tenant, user='u') {
  const req = { headers: { 'x-tenant-id': tenant, 'x-user-id': user } };
  const res = { headers: {}, setHeader(k,v){ this.headers[k]=v; }, json(b){ this.body=b; this.sent=true; } };
  const blocked = rateLimit(req, res);
  return { blocked, res };
}

test('separate buckets per tenant', () => {
  // Exhaust some tokens for T1 user u1
  let blocked=false;
  for (let i=0;i<65;i++){ blocked = call('t1','u1').blocked; if (blocked) break; }
  expect(blocked).toBe(true); // burst 60 by default
  // T2 should still have its own bucket
  const ans = call('t2','u1');
  expect(ans.blocked).toBe(false);
});
