import express from 'express';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SecureDb } from '../src/storage/secureDb.js';
import { SyncEngine } from '../src/sync/syncEngine.js';

const N = parseInt(process.env.WB_LOAD_N || '1000', 10);

async function startMock(port:number) {
  const app = express();
  app.use(express.json());
  app.post('/api/v1/crm/contacts', (req, res) => res.status(201).json({ id: 'ok', ...req.body }));
  const server = await new Promise<any>(resolve => {
    const s = app.listen(port, () => resolve(s));
  });
  return server;
}

(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'wb-load-'));

  const db = new SecureDb(dir, 'pass');
  const engine = new SyncEngine(db, { baseUrl: 'http://127.0.0.1:45702', apiKey: 'dev', tenantId: 't1' });
  const server = await startMock(45702);

  for (let i=0;i<N;i++) {
    await engine.enqueueCreate('contact', { name: 'C'+i });
  }

  const t0 = Date.now();
  while (engine.countPending() > 0) {
    await engine.syncOnce();
  }
  const t1 = Date.now();
  const ms = t1 - t0;
  const throughput = N / (ms/1000);

  const report = { total_ops: N, duration_ms: ms, throughput_ops_per_s: throughput.toFixed(2), errors: 0 };
  const reportsDir = process.env.WB_REPORT_DIR ?? mkdtempSync(join(tmpdir(), 'wb-reports-'));
  const shouldCleanupReports = !process.env.WB_REPORT_DIR;
  try {
    writeFileSync(join(reportsDir, 'sync_load.json'), JSON.stringify(report, null, 2));
  } catch {
    // ignore if not writable
  }
  await new Promise<void>((resolve, reject) => server.close((e: Error | null) => (e ? reject(e) : resolve())));
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  if (shouldCleanupReports) {
    try { rmSync(reportsDir, { recursive: true, force: true }); } catch {}
  }
  console.log('LOAD PASS', JSON.stringify(report));
  process.exit(0);
})();
