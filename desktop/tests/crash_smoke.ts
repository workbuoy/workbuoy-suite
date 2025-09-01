import { existsSync, readdirSync } from 'fs';
import { installCrashHandling } from '../src/telemetry/crash.js';
import { initTelemetry } from '../src/telemetry/otel.js';

(async () => {
  process.env.CRASH_TEST_MODE = '1';
  initTelemetry();
  installCrashHandling('crashlogs');

  // simulate crash (uncaughtException)
  setTimeout(() => {
    // @ts-ignore
    throw new Error('simulated crash');
  }, 0);

  // wait for handler to run
  setTimeout(() => {
    if (!existsSync('crashlogs')) {
      console.error('Crashlogs directory not created');
      process.exit(1);
    }
    const files = readdirSync('crashlogs').filter(f => f.endsWith('.json'));
    if (!files.length) {
      console.error('No crash log file found');
      process.exit(1);
    }
    console.log('Crash smoke OK, files:', files.slice(-3));
    process.exit(0);
  }, 200);
})();
