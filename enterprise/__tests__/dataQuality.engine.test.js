
import { suggestCleanup } from '../lib/data/cleanupEngine.js';
import { applyWritebackIfPermitted } from '../lib/data/writebackPolicy.js';

test('suggests standardization and confidence', ()=>{
  const recs=[{id:1, name:'acme  inc', phone:'(555) 123-4567', date:'1/2/2024'}];
  const out = suggestCleanup(recs,'crm','tester@example.com');
  expect(out.length).toBe(1);
  expect(out[0].confidence).toBeGreaterThan(0.5);
});

test('high-value guard blocks auto-apply', ()=>{
  const sugg = { before:{amount:600000}, after:{amount:600000}, confidence:0.99 };
  const user = { roles:['admin'] };
  const res = applyWritebackIfPermitted(sugg, user);
  expect(res.allowed).toBe(false);
  expect(res.reason).toBe('high_value_manual_only');
});
