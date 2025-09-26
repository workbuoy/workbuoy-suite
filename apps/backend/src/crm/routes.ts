import { Router } from 'express';
import multer from 'multer';
import { parse as parseCsv } from 'csv-parse/sync';
import { repo } from './repo.js';
import { requireRole } from '@workbuoy/backend-rbac';
import { audit } from '../audit/audit.js';

export const crmRouter = Router();
const upload = multer();

const requireRead = requireRole('viewer');
const requireWrite = requireRole('contributor');
const requireAdmin = requireRole('admin');

function tenant(req:any){ return String(req.header('x-tenant-id') || 't1'); }
function actor(req:any){ return String(req.header('x-user-id') || 'system'); }

// Pipelines
crmRouter.get('/api/v1/crm/pipelines', requireRead, async (req, res) => {
  const items = await repo.list('pipelines', tenant(req), parseInt(String(req.query.limit||'50')));
  res.json({ items });
});

crmRouter.post('/api/v1/crm/pipelines', requireWrite, async (req, res) => {
  const row = await repo.create('pipelines', tenant(req), { name: req.body.name, stages: req.body.stages||[] });
  audit({ type:'crm.mutation', op:'create', entity:'pipeline', id: row.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.status(201).json(row);
});

crmRouter.get('/api/v1/crm/pipelines/:id', requireRead, async (req, res) => {
  const r = await repo.get('pipelines', tenant(req), req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

crmRouter.patch('/api/v1/crm/pipelines/:id', requireWrite, async (req, res) => {
  const r = await repo.patch('pipelines', tenant(req), req.params.id, req.body);
  if (!r) return res.status(404).json({ error: 'not found' });
  audit({ type:'crm.mutation', op:'patch', entity:'pipeline', id: r.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.json(r);
});

crmRouter.delete('/api/v1/crm/pipelines/:id', requireAdmin, async (req, res) => {
  await repo.del('pipelines', tenant(req), req.params.id);
  audit({ type:'crm.mutation', op:'delete', entity:'pipeline', id: req.params.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.status(204).end();
});

// Contacts
crmRouter.get('/api/v1/crm/contacts', requireRead, async (req, res) => {
  const items = await repo.list('contacts', tenant(req), parseInt(String(req.query.limit||'50')));
  res.json({ items });
});
crmRouter.post('/api/v1/crm/contacts', requireWrite, async (req, res) => {
  const row = await repo.create('contacts', tenant(req), req.body);
  audit({ type:'crm.mutation', op:'create', entity:'contact', id: row.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.status(201).json(row);
});
crmRouter.get('/api/v1/crm/contacts/:id', requireRead, async (req, res) => {
  const r = await repo.get('contacts', tenant(req), req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
crmRouter.patch('/api/v1/crm/contacts/:id', requireWrite, async (req, res) => {
  const r = await repo.patch('contacts', tenant(req), req.params.id, req.body);
  if (!r) return res.status(404).json({ error: 'not found' });
  audit({ type:'crm.mutation', op:'patch', entity:'contact', id: r.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.json(r);
});
crmRouter.delete('/api/v1/crm/contacts/:id', requireAdmin, async (req, res) => {
  await repo.del('contacts', tenant(req), req.params.id);
  audit({ type:'crm.mutation', op:'delete', entity:'contact', id: req.params.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.status(204).end();
});

// Opportunities
crmRouter.get('/api/v1/crm/opportunities', requireRead, async (req, res) => {
  const items = await repo.list('opportunities', tenant(req), parseInt(String(req.query.limit||'50')));
  res.json({ items });
});
crmRouter.post('/api/v1/crm/opportunities', requireWrite, async (req, res) => {
  const row = await repo.create('opportunities', tenant(req), req.body);
  audit({ type:'crm.mutation', op:'create', entity:'opportunity', id: row.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.status(201).json(row);
});
crmRouter.get('/api/v1/crm/opportunities/:id', requireRead, async (req, res) => {
  const r = await repo.get('opportunities', tenant(req), req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});
crmRouter.patch('/api/v1/crm/opportunities/:id', requireWrite, async (req, res) => {
  const r = await repo.patch('opportunities', tenant(req), req.params.id, req.body);
  if (!r) return res.status(404).json({ error: 'not found' });
  audit({ type:'crm.mutation', op:'patch', entity:'opportunity', id: r.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.json(r);
});
crmRouter.delete('/api/v1/crm/opportunities/:id', requireAdmin, async (req, res) => {
  await repo.del('opportunities', tenant(req), req.params.id);
  audit({ type:'crm.mutation', op:'delete', entity:'opportunity', id: req.params.id, tenant_id: tenant(req), actor_id: actor(req) });
  res.status(204).end();
});

// Import (CSV/JSON)
crmRouter.post('/api/v1/crm/import', requireWrite, upload.single('file'), async (req, res) => {
  const tenantId = tenant(req);
  const entity = String(req.body.entity || 'contacts');
  const dry = String(req.body.dry_run || 'false') === 'true';
  let items: any[] = [];

  if (req.is('application/json') && Array.isArray(req.body.items)) {
    items = req.body.items;
  } else if (req.file) {
    const contentType = req.file.mimetype || 'text/csv';
    const buf = req.file.buffer;
    if (contentType.includes('csv')) {
      const recs = parseCsv(buf.toString('utf8'), { columns: true, skip_empty_lines: true });
      items = recs;
    } else {
      items = JSON.parse(buf.toString('utf8'));
    }
  } else {
    return res.status(400).json({ error: 'No items or file provided' });
  }

  let imported=0, failed=0; const failures:string[] = [];
  if (!dry) {
    for (const it of items) {
      try {
        if (entity === 'contacts') await repo.create('contacts', tenantId, it);
        else if (entity === 'opportunities') await repo.create('opportunities', tenantId, it);
        else throw new Error('unsupported entity');
        imported++;
      } catch (e:any) { failed++; failures.push(e.message||'error'); }
    }
  }
  res.json({ entity, imported, failed, failures, dry_run: dry });
});

// Export
crmRouter.get('/api/v1/crm/export', requireRead, async (req, res) => {
  const tenantId = tenant(req);
  const entity = String(req.query.entity || 'contacts');
  const format = String(req.query.format || 'json');
  let items: any[] = [];
  if (entity === 'contacts') items = await repo.list('contacts', tenantId, 10000);
  else if (entity === 'opportunities') items = await repo.list('opportunities', tenantId, 10000);
  else return res.status(400).json({ error: 'unsupported entity' });

  if (format === 'csv') {
    if (items.length === 0) return res.type('text/csv').send('');
    const headers = Object.keys(items[0]);
    const lines = [headers.join(',')].concat(items.map(x => headers.map(h => JSON.stringify(x[h] ?? '')).join(',')));
    res.type('text/csv').send(lines.join('\n'));
  } else {
    res.json({ items });
  }
});
