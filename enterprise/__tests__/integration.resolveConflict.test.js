import { resolveConflict } from '../lib/integration/data-sync-manager.js';
test('resolveConflict priority then ts then dqScore', ()=>{
  const policy = { sourcePriority:['salesforce','hubspot','d365','fallback'] };
  const a = { source:'hubspot', ts: 10, dqScore: 0.7, value:'X' };
  const b = { source:'d365', ts: 999, dqScore: 0.9, value:'Y' };
  const r = resolveConflict('email', a, b, policy);
  expect(r).toBe(a);
});
