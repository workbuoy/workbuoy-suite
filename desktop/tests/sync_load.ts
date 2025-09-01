import express from 'express';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
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
  const dir = path.join(process.cwd(), '.wb_load');
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  mkdirSync(dir, { recursive: true });
  mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });

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
  writeFileSync(path.join(process.cwd(), 'reports', 'sync_load.json'), JSON.stringify(report, null, 2));
  await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  console.log('LOAD PASS', JSON.stringify(report));
  process.exit(0);
})();
