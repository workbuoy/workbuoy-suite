import express from 'express';
import { mkdirSync, rmSync } from 'fs';
import path from 'path';
import { SecureDb } from '../src/storage/secureDb.js';
import { SyncEngine } from '../src/sync/syncEngine.js';

(async () => {
  const dir = path.join(process.cwd(), '.wb_conflict');
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  mkdirSync(dir, { recursive: true });

  // Mock CRM API with one contact (remote newer/older scenarios)
  const app = express();
  app.use(express.json());
  let contact = { id: 'c9', name: 'Remote Bob', updated_at: Date.now() };
  app.get('/api/v1/crm/contacts', (req, res) => res.json({ items: [contact] }));
  app.patch('/api/v1/crm/contacts/:id', (req, res) => { contact = { ...contact, ...req.body }; res.json(contact); });
  app.post('/api/v1/crm/contacts', (req, res) => { res.status(201).json({ id: 'new', ...req.body }); });

  const server = await new Promise<any>(resolve => {
    const s = app.listen(45678, () => resolve(s));
  });

  const db = new SecureDb(dir, 'pass');
  const engine = new SyncEngine(db, { baseUrl: 'http://127.0.0.1:45678', apiKey: 'dev', tenantId: 't1' });

  // Put local cached version older than remote -> expect remote wins (LWW)
  const olderTs = Date.now() - 10000;
  db.putCache('c9', 'contact', { id: 'c9', name: 'Local Older', updated_at: olderTs }, olderTs);
  await engine.syncOnce();
  const post1 = db.getCache('c9')!.payload;
  if (post1.name !== 'Remote Bob') { console.error('LWW remote not chosen'); process.exit(1); }

  // Now set local to be newer -> expect local pushed to server and chosen
  const newerTs = Date.now() + 10000;
  db.putCache('c9', 'contact', { id: 'c9', name: 'Local Newer', updated_at: newerTs }, newerTs);
  await engine.syncOnce();
  if (db.getCache('c9')!.payload.name !== 'Local Newer') { console.error('LWW local not chosen'); process.exit(1); }

  // Merge hook test: prefer concatenation
  const engine2 = new SyncEngine(db, { baseUrl: 'http://127.0.0.1:45678', apiKey: 'dev', tenantId: 't1',
    onMerge: (entity, local, remote) => ({ ...remote, name: remote.name + ' + ' + local.name, updated_at: Math.max(local.updated_at, remote.updated_at) })
  });
  db.putCache('c9', 'contact', { id: 'c9', name: 'LocalX', updated_at: Date.now() }, Date.now());
  // Remote name is whatever last; force conflict by changing remote timestamp
  await new Promise(r => setTimeout(r, 10));
  app.get('/api/v1/crm/contacts', (req, res) => res.json({ items: [{ id:'c9', name: 'RemoteY', updated_at: Date.now() }] }));
  await engine2.syncOnce();
  const merged = db.getCache('c9')!.payload.name;
  if (!merged.includes(' + ')) { console.error('Merge hook not applied'); process.exit(1); }

  console.log('CONFLICT PASS');
  await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  process.exit(0);
})();
