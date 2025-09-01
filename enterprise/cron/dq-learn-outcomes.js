// scripts/cron/dq-learn-outcomes.js
import { DataWritebackEngine } from '../../lib/data-quality/writeback-engine.js';
export async function run(deps) {
  const engine = new DataWritebackEngine(deps.connectors, deps.approval);
  await engine.learnFromOutcomes();
  deps.metrics.increment('wb_dq_learn_outcomes_runs_total');
  console.log('learnFromOutcomes completed');
}
if (process.argv[1] && process.argv[1].includes('dq-learn-outcomes.js')) {
  run(globalThis.__deps || { connectors:{}, approval:{}, metrics: { increment: ()=>{} } });
}
