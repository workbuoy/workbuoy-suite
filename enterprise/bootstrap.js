import { startScheduler } from './jobs/scheduler.js';

const g = globalThis;
if (!g.__WB_BOOTSTRAP_DONE__) {
  g.__WB_BOOTSTRAP_DONE__ = true;
  if (process.env.WB_ENABLE_SCHEDULER === 'true') {
    startScheduler();
  }
}
