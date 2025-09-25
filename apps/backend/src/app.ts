import express from 'express';
import { randomUUID } from 'crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { canAccess, EntityType, RecordMeta } from './rbac/policies.js';
import { clearAudit, getAudit, pushAudit } from './rbac/audit.js';
import { createEvolutionRouter } from './meta-evolution/routes/evolution.routes.js';

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/meta-evolution', createEvolutionRouter());

  const requireFromHere = createRequire(import.meta.url);
  const rolesDataPath = requireFromHere.resolve('@workbuoy/roles-data/roles.json');
  let cachedRoles: unknown[] | null = null;

  function loadCanonicalRoles(): unknown[] {
    if (cachedRoles) {
      return cachedRoles;
    }
    const raw = readFileSync(rolesDataPath, 'utf8');
    const parsed = JSON.parse(raw);
    cachedRoles = Array.isArray(parsed) ? parsed : [];
    return cachedRoles;
  }

  app.get('/public/data/roles.json', (_req, res) => {
    try {
      res.json(loadCanonicalRoles());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'roles_dataset_unavailable', message });
    }
  });

  // simple in-memory store
  const store: Record<string, RecordMeta & any> = {};

  function actor(req:any){
    return {
      role: String(req.header('x-user-role') || 'viewer'),
      user_id: String(req.header('x-user-id') || 'u0'),
      team_id: req.header('x-user-team') || undefined
    } as any;
  }

  function aud(action:string, actor_id:string, role:string, entity_type:string, entity_id:string, allowed:boolean, reason?:string, before?:any, after?:any) {
    pushAudit({ ts: Date.now(), actor_id, role, entity_type, entity_id, action, allowed, reason, before, after });
  }

  app.post('/_admin/seed', (req,res)=>{
    Object.assign(store, req.body||{});
    clearAudit();
    res.json({ ok:true, n: Object.keys(store).length });
  });

  app.get('/_admin/audit', (_req,res)=>res.json(getAudit()));

  // CRUD
  app.get('/api/v1/crm/:type(contacts|opportunities)/:id', (req,res)=>{
    const type = req.params.type === 'contacts' ? 'contact' : 'opportunity';
    const key = `${type}:${req.params.id}`;
    const rec = store[key];
    const a = actor(req);
    const decision = canAccess(a, rec, { action:'read' });
    aud('read', a.user_id, a.role, type, req.params.id, decision.allow, decision.reason);
    if (!decision.allow) return res.status(403).json({ error:'forbidden' });
    if (!rec) return res.status(404).json({ error:'not_found' });
    res.json(rec);
  });

  app.post('/api/v1/crm/:type(contacts|opportunities)', (req,res)=>{
    const type = req.params.type === 'contacts' ? 'contact' : 'opportunity';
    const id = randomUUID();
    const a = actor(req);
    const changes = { ...req.body, owner_id: req.body.owner_id || a.user_id } as any;
    const decision = canAccess(a, null, { action:'create', changes });
    aud('create', a.user_id, a.role, type, id, decision.allow, decision.reason, undefined, changes);
    if (!decision.allow) return res.status(403).json({ error:'forbidden', reason: decision.reason });
    const rec: RecordMeta & any = { id, entity_type: type as any, pipeline_id: changes.pipeline_id || 'p1', ...changes };
    store[`${type}:${id}`] = rec;
    res.status(201).json(rec);
  });

  app.patch('/api/v1/crm/:type(contacts|opportunities)/:id', (req,res)=>{
    const type = req.params.type === 'contacts' ? 'contact' : 'opportunity';
    const key = `${type}:${req.params.id}`;
    const rec = store[key];
    if (!rec) return res.status(404).json({ error:'not_found' });
    const a = actor(req);
    const decision = canAccess(a, rec, { action:'update', changes: req.body });
    const before = { ...rec };
    if (!decision.allow) { aud('update', a.user_id, a.role, type, req.params.id, false, decision.reason, before, undefined); return res.status(403).json({ error:'forbidden', reason: decision.reason }); }
    Object.assign(rec, req.body);
    store[key] = rec;
    aud('update', a.user_id, a.role, type, req.params.id, true, undefined, before, rec);
    res.json(rec);
  });

  app.delete('/api/v1/crm/:type(contacts|opportunities)/:id', (req,res)=>{
    const type = req.params.type === 'contacts' ? 'contact' : 'opportunity';
    const key = `${type}:${req.params.id}`;
    const rec = store[key];
    if (!rec) return res.status(404).json({ error:'not_found' });
    const a = actor(req);
    const decision = canAccess(a, rec, { action:'delete' });
    if (!decision.allow) { aud('delete', a.user_id, a.role, type, req.params.id, false, decision.reason, rec, undefined); return res.status(403).json({ error:'forbidden', reason: decision.reason }); }
    delete store[key];
    aud('delete', a.user_id, a.role, type, req.params.id, true, undefined, rec, undefined);
    res.status(204).end();
  });

  return app;
}
