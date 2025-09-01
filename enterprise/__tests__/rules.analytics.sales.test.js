import { generateAnalyticsSignals } from '../../lib/rules/analytics.sales.js';
import { upsertSalesFacts } from '../../lib/connectors/analytics.js';

test('analytics rules trigger revenue_drop/target_gap/mix', async ()=>{
  const today = new Date().toISOString().slice(0,10);
  upsertSalesFacts([
    { date:today, customer_id:'ACME', product_id:'Core',  ytd:100, ly_ytd:200, qtd:10, lq_qtd:50, mtd:30, lm_mtd:60, target:200 },
    { date:today, customer_id:'ACME', product_id:'AddOn', ytd:100, ly_ytd:50,  qtd:20, lq_qtd:10, mtd:70, lm_mtd:40, target:100 }
  ]);
  const signals = await generateAnalyticsSignals({date:today});
  const types = signals.map(s=>s.type);
  expect(types).toContain('analytics:revenue_drop');
  expect(types).toContain('analytics:target_gap');
  expect(types).toContain('analytics:product_mix_shift');
});
