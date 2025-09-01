import express from 'express';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { SecureDb } from '../src/storage/secureDb.js';
import { SyncEngine } from '../src/sync/syncEngine.js';

async function startMock(port:number) {
  const app = express();
  app.use(express.json());
  let created = 0;
  app.post('/api/v1/crm/contacts', (req, res) => {
    created++;
    res.status(201).json({ id: 'srv_'+created, ...req.body });
  });
  const server = await new Promise<any>(resolve => {
    const s = app.listen(port, () => resolve(s));
  });
  return { server, stat: ()=>({ created }) };
}

(async () => {
  const dir = path.join(process.cwd(), '.wb_e2e');
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  mkdirSync(dir, { recursive: true });

  const db = new SecureDb(dir, 'pass');
  const engine = new SyncEngine(db, { baseUrl: 'http://127.0.0.1:45701', apiKey: 'dev', tenantId: 't1' });

  // Offline: enqueue and attempt sync (should fail)
  await engine.enqueueCreate('contact', { name: 'Alice' });
  let failed = false;
  try { await engine.syncOnce(); } catch (e) { failed = true; }
  if (!failed) { console.error('Expected sync to fail when server is down'); process.exit(1); }
  if (engine.countPending() < 1) { console.error('Queue should retain ops after failure'); process.exit(1); }

  // Online: start server and sync again
  const { server, stat } = await startMock(45701);
  try {
    await engine.syncOnce();
  } catch (e) {
    console.error('Sync should succeed when server is up', e);
    process.exit(1);
  }

  const out = { created: stat().created, pending: engine.countPending() };
  writeFileSync(path.join(process.cwd(), 'reports', 'e2e_offline_sync.json'), JSON.stringify(out, null, 2));
  await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));

  if (out.created !== 1 || out.pending !== 0) { console.error('E2E assertions failed', out); process.exit(1); }
  console.log('E2E PASS', JSON.stringify(out));
  process.exit(0);
})();
