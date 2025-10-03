import express from 'express';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SecureDb } from '../src/storage/secureDb.js';
import { SyncEngine } from '../src/sync/syncEngine.js';

type Contact = { id: string, name: string, email?: string, updated_at: number };

function startMockCRM(port:number) {
  const app = express();
  app.use(express.json());
  const db: Record<string, Contact> = {};
  // seed record
  const id = 'c1';
  db[id] = { id, name: 'Alice', email: 'a@x.com', updated_at: Date.now() };

  app.get('/api/v1/crm/contacts/:id', (req,res)=>{
    const r = db[req.params.id]; if (!r) return res.status(404).end();
    res.json(r);
  });
  app.patch('/api/v1/crm/contacts/:id', (req,res)=>{
    const r = db[req.params.id]; if (!r) return res.status(404).end();
    const force = req.query.force === '1';
    const incoming = req.body as Partial<Contact>;
    if (!force && incoming.updated_at && incoming.updated_at < r.updated_at) {
      return res.status(409).json({ error: 'conflict', current: r });
    }
    db[req.params.id] = { ...r, ...incoming, updated_at: Date.now() };
    res.json(db[req.params.id]);
  });

  return new Promise<any>(resolve=>{
    const s = app.listen(port, ()=>resolve({ server: s, db }));
  });
}

(async () => {
  const port = 45711;
  const { server, db } = await startMockCRM(port);

  const dir = mkdtempSync(join(tmpdir(), 'wb-conflict-'));

  const sdb = new SecureDb(dir);
  const engineLWW = new SyncEngine(sdb, { baseUrl: `http://127.0.0.1:${port}`, apiKey: 'dev', tenantId: 't1', conflict: 'lww' });
  const engineMerge = new SyncEngine(sdb, { baseUrl: `http://127.0.0.1:${port}`, apiKey: 'dev', tenantId: 't1', conflict: 'merge' });

  // Simulate local update based on older snapshot
  const oldTs = db['c1'].updated_at - 1000;
  await engineLWW.enqueueUpdate('contact', 'c1', { name: 'Alice Local', updated_at: oldTs });
  try { await engineLWW.syncOnce(); } catch (e) { console.error('LWW sync failed', e); process.exit(1); }
  if (db['c1'].name !== 'Alice Local') { console.error('LWW should overwrite server', db['c1']); process.exit(1); }

  // Change server and then local merge update
  const now = Date.now();
  db['c1'] = { ...db['c1'], email: 'server@x.com', updated_at: now };
  await engineMerge.enqueueUpdate('contact', 'c1', { name: 'Merged Local', updated_at: now - 500 });
  try { await engineMerge.syncOnce(); } catch (e) { console.error('Merge sync failed', e); process.exit(1); }
  if (!(db['c1'].name === 'Merged Local' && db['c1'].email === 'server@x.com')) {
    console.error('Merge should preserve server email and set local name', db['c1']); process.exit(1);
  }

  await new Promise<void>((resolve, reject) => server.close((e: Error | null) => (e ? reject(e) : resolve())));
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  console.log('Conflict PASS', db['c1']);
  process.exit(0);
})();
