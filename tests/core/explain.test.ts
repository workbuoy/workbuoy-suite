import { buildExplanation } from '../../src/core/explain/explain';

describe('buildExplanation', () => {
  it('clamps confidence into 0..1', () => {
    const e = buildExplanation({ reasoning:'x', sources:[], confidence: 2 });
    expect(e.confidence).toBe(1);
  });
  it('passes through fields', () => {
    const e = buildExplanation({ reasoning:'why', sources:[{uri:'x'}], confidence: .5, impact:'5m', alternatives:[{type:'approve'}] });
    expect(e.reasoning).toBe('why');
    expect(e.impact).toBe('5m');
    expect(e.alternatives?.[0].type).toBe('approve');
  });
});
