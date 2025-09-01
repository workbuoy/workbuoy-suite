
// tests/jest/perf_autotune.test.js
import { HighPerformanceScoringEngine } from '../../lib/scoring/high-perf-engine.js';

test('auto-tune adjusts batch size', async () => {
  const db = { prepare: () => ({ all: async ()=>[] }), getConnection: async ()=>({}), releaseConnection: ()=>{}, exec: ()=>{} };
  const cache = { mget: async ()=>[], pipeline: ()=>({ exec: async()=>{} }) };
  const engine = new HighPerformanceScoringEngine(db, cache, { batch_size: 200, max_concurrency: 4 });
  for (let i=0;i<12;i++){ engine.recordBatchMetrics(200, i<6?40:120); } // faster then slower
  expect(engine.batchSize).not.toBe(200);
});
