import { scoreSignal } from '../../lib/signals.score.js';

test('scores include role/kpi/stakeholder/time and context bonus', ()=>{
  const signal = { type:'analytics:target_gap', title:'gap', payload:{ time_hint:'quarter_end', context_match:0.15 } };
  const goals = { role:'Account Manager', kpi_name:'target_gap', stakeholder_tags: JSON.stringify(['key_accounts']) };
  const s = scoreSignal({signal, user:{id:'u1'}, goals});
  expect(s).toBeGreaterThan(0.5);
  expect(s).toBeLessThanOrEqual(1);
});
