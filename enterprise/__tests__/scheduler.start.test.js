/**
 * Ensures scheduler start does not throw and returns started flag.
 */
import { startScheduler } from '../lib/jobs/scheduler.js';

test('startScheduler returns started', () => {
  const rv = startScheduler(1000000);
  expect(rv.started).toBe(true);
});
