
// tests/jest/data_quality.test.js
import { ValidationRulesEngine } from '../../lib/data-quality/validation-rules.js';
import { DataWritebackEngine } from '../../lib/data-quality/writeback-engine.js';

test('validate rules returns issues for unrealistic close date', async () => {
  const rules = new ValidationRulesEngine();
  const issues = await rules.validateRecord('opportunity', { amount: 200000, probability: 0.1, close_date: new Date().toISOString(), created_date: new Date().toISOString() });
  expect(Array.isArray(issues)).toBe(true);
  expect(issues.find(i => i.rule.includes('close_date_realism'))).toBeTruthy();
});

test('writeback auto-applies when confidence >= 0.85', async () => {
  const engine = new DataWritebackEngine({ salesforce: { updateRecord: async ()=>({ok:true}) } }, { createRequest: async ()=> 'appr1' });
  const res = await engine.processCleanupSuggestions([{ confidence: 0.9, target_system:'salesforce', record_id:'X', changes:{ amount: 123 } }], 'u1');
  expect(res.auto_applied.length).toBe(1);
});
