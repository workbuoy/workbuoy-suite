import { cohortKey, effectiveCohortBoost } from '../lib/signals.cohort.js';

describe('cohort granularity', ()=>{
  test('key role:tier', ()=>{
    expect(cohortKey('admin','gold')).toBe('admin:gold');
    expect(cohortKey('sales','')).toBe('sales:unknown');
  });
  test('damped by personal confidence', ()=>{
    expect(effectiveCohortBoost(1.0, 0.0)).toBeCloseTo(1.0,5);
    expect(effectiveCohortBoost(1.0, 0.5)).toBeCloseTo(0.5,5);
    expect(effectiveCohortBoost(1.0, 1.0)).toBeCloseTo(0.0,5);
  });
});
