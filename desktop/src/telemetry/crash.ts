import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { crashCounter } from './otel.js';

function trimToLastN(dir: string, n: number) {
  const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const excess = Math.max(0, files.length - n);
  for (let i=0;i<excess;i++) {
    try { require('fs').unlinkSync(join(dir, files[i])); } catch {}
  }
}

export function installCrashHandling(dir = 'crashlogs') {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const ctr = crashCounter();

  function writeCrash(kind: string, err: any) {
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const file = join(dir, `wb-crash-${ts}.json`);
    const payload = {
      kind,
      ts: new Date().toISOString(),
      message: err?.message || String(err),
      stack: err?.stack || null
    };
    try { writeFileSync(file, JSON.stringify(payload, null, 2)); } catch {}
    try { trimToLastN(dir, 50); } catch {}
    try { ctr.add(1); } catch {}
  }

  process.on('uncaughtException', (err) => {
    writeCrash('uncaughtException', err);
    if (process.env.CRASH_TEST_MODE === '1') {
      // do not exit during smoke tests
    } else {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason) => {
    writeCrash('unhandledRejection', reason);
    if (process.env.CRASH_TEST_MODE === '1') {
      // keep process alive for tests
    } else {
      process.exit(1);
    }
  });
}
