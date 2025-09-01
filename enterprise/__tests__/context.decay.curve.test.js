import { contextDecay, decayWithFactor } from '../lib/signals.aging.js';

describe('context decay', ()=>{
  test('within 0..1 range with floor 0.3', ()=>{
    expect(contextDecay(0)).toBeCloseTo(1, 5);
    expect(contextDecay(30)).toBeCloseTo(0.3, 5);
    expect(contextDecay(100)).toBeCloseTo(0.3, 5);
  });
  test('monotonic non-increasing', ()=>{
    const vals = [0,5,10,15,20,25,30].map(d=>contextDecay(d));
    const sorted = [...vals].sort((a,b)=>b-a);
    expect(vals.join(',')).toBe(sorted.join(','));
  });
  test('multiplies with agingFactor', ()=>{
    expect(decayWithFactor(10, 0.5)).toBeCloseTo(contextDecay(10)*0.5, 5);
  });
});
