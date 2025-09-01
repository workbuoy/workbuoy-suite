
import { scoreBatch } from '../lib/perf/scoringBatcher.js';

test('scores batches and auto-tunes', async ()=>{
  const sigs = Array.from({length:200}).map((_,i)=>({ id:i, urgency:0.5, impact:0.5 }));
  const out = await scoreBatch(sigs);
  expect(out.length).toBe(200);
});
