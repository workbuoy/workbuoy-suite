import { Router } from 'express';
import { store, nowIso, ScimUser, ScimGroup } from './dir.js';
import { audit } from '../audit/audit.js';

function parseFilter(filter: string|undefined) {
  if (!filter) return null;
  // very small subset: userName eq "value"
  const m = filter.match(/^userName\s+eq\s+\"([^\"]+)\"$/i);
  if (!m) return null;
  return { field: 'userName', op: 'eq', value: m[1] };
}

function paginate<T>(items: T[], startIndex: number, count: number) {
  const start = Math.max(1, startIndex) - 1;
  const page = items.slice(start, start + count);
  return { page, total: items.length, startIndex, itemsPerPage: page.length };
}

export function scimRouter() {
  const r = Router();

  // Users
  r.get('/scim/v2/Users', (req, res) => {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const s = store(tenant);
    const filter = parseFilter(req.query.filter as string|undefined);
    const startIndex = parseInt(String(req.query.startIndex || '1'), 10);
    const count = parseInt(String(req.query.count || '50'), 10);

    let users = s.users;
    if (filter && filter.field==='userName' && filter.op==='eq') {
      users = users.filter(u => u.userName === filter.value);
    }

    const { page, total, itemsPerPage } = paginate(users, startIndex, count);
    res.json({
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults: total,
      startIndex,
      itemsPerPage,
      Resources: page
    });
  });

  r.get('/scim/v2/Users/:id', (req, res) => {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const u = store(tenant).users.find(u => u.id === req.params.id);
    if (!u) return res.status(404).json({ detail: 'Not found' });
    res.json(u);
  });

  r.post('/scim/v2/Users', (req, res) => {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const s = store(tenant);
    const body = req.body || {};
    if (!body.userName) return res.status(400).json({ detail: 'userName required' });
    const id = 'u_' + Math.random().toString(36).slice(2);
    const u: ScimUser = {
      id,
      userName: body.userName,
      name: body.name || {},
      displayName: body.displayName || body.userName,
      active: body.active !== false,
      emails: body.emails || [],
      groups: [],
      tenant_id: tenant,
      meta: { created: nowIso(), lastModified: nowIso(), resourceType: 'User' }
    };
    s.users.push(u);
    audit({ type: 'scim.provision', tenant_id: tenant, actor_id: null, details: { op: 'create', userId: id } });
    res.status(201).json(u);
  });

  r.patch('/scim/v2/Users/:id', (req, res) => {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const s = store(tenant);
    const u = s.users.find(u => u.id === req.params.id);
    if (!u) return res.status(404).json({ detail: 'Not found' });
    const ops = (req.body?.Operations || []) as any[];
    for (const op of ops) {
      const type = (op.op || 'replace').toLowerCase();
      if (type === 'replace') {
        if (op.path === 'displayName') u.displayName = op.value;
        else if (op.path === 'active') u.active = !!op.value;
        else if (!op.path && typeof op.value === 'object') Object.assign(u, op.value);
      }
      if (type === 'add') {
        if (op.path === 'emails') u.emails = [...(u.emails||[]), ...(Array.isArray(op.value)?op.value:[op.value])];
      }
      if (type === 'remove') {
        if (op.path?.startsWith('emails')) u.emails = [];
      }
    }
    u.meta!.lastModified = nowIso();
    audit({ type: 'scim.provision', tenant_id: tenant, actor_id: null, details: { op: 'patch', userId: u.id } });
    res.json(u);
  });

  r.delete('/scim/v2/Users/:id', (req, res) => {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const s = store(tenant);
    const u = s.users.find(u => u.id === req.params.id);
    if (!u) return res.status(404).json({ detail: 'Not found' });
    u.active = false;
    u.meta!.lastModified = nowIso();
    audit({ type: 'scim.provision', tenant_id: tenant, actor_id: null, details: { op: 'deactivate', userId: u.id } });
    res.status(204).end();
  });

  // Groups (minimal)
  r.get('/scim/v2/Groups', (req, res) => {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const s = store(tenant);
    res.json({
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults: s.groups.length,
      startIndex: 1,
      itemsPerPage: s.groups.length,
      Resources: s.groups
    });
  });

  r.post('/scim/v2/Groups', (req, res) => {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const s = store(tenant);
    const id = 'g_' + Math.random().toString(36).slice(2);
    const g: ScimGroup = { id, displayName: req.body.displayName || id, members: [], tenant_id: tenant, meta: { created: nowIso(), lastModified: nowIso(), resourceType: 'Group' } };
    s.groups.push(g);
    audit({ type: 'scim.provision', tenant_id: tenant, actor_id: null, details: { op: 'group.create', groupId: id } });
    res.status(201).json(g);
  });

  return r;
}
