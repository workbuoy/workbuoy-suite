import { Router } from 'express';
import multer from 'multer';
import { wb_import_total, wb_import_fail_total, wb_export_total } from '../metrics/metrics.js';

export const importExportRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

type Entity = 'contacts'|'opportunities';
type Store = { contacts: any[]; opportunities: any[]; };
const memByTenant = new Map<string, Store>();
const dlq: any[] = []; // {id, entity, error, record, tenant_id, ts}

function storeFor(tenant: string): Store {
  if (!memByTenant.has(tenant)) memByTenant.set(tenant, { contacts: [], opportunities: [] });
  return memByTenant.get(tenant)!;
}

function parseCSV(buf: Buffer) {
  const text = buf.toString('utf8').replace('\r\n','\n');
  const lines = text.split(/\n/).filter(l => l.trim().length>0);
  if (lines.length<1) return [];
  const header = lines[0].split(',').map(s => s.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj:any = {};
    header.forEach((h, i) => obj[h] = (cols[i]||'').trim());
    return obj;
  });
}

function validate(entity: Entity, rec: any): string|null {
  if (entity==='contacts') {
    if (!rec.name || String(rec.name).trim()==='') return 'name is required';
  }
  if (entity==='opportunities') {
    if (!rec.title || String(rec.title).trim()==='') return 'title is required';
  }
  return null;
}

function toCSV(items: any[]) {
  if (!items.length) return 'id\n';
  const keys = Array.from(new Set(items.flatMap(o => Object.keys(o))));
  const rows = [keys.join(',')];
  for (const it of items) rows.push(keys.map(k => (it[k] ?? '')).join(','));
  return rows.join('\n');
}

importExportRouter.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const entity = String(req.body.entity || 'contacts') as Entity;
    const dry = String(req.body.dry_run || 'false').toLowerCase() === 'true';
    const idem = String(req.header('Idempotency-Key') || '');
    // naive idempotency: if key provided and seen in process memory, short-circuit
    (global as any).__idem = (global as any).__idem || new Set();
    if (idem && (global as any).__idem.has(idem)) return res.json({ entity, imported: 0, failed: 0, dry_run: dry, idempotent: true });
    if (idem) (global as any).__idem.add(idem);

    const file = req.file;
    const st = storeFor(tenant);
    let records: any[] = [];

    if (!file) return res.status(400).json({ error: 'file required (CSV or JSON)' });
    if ((file.mimetype || '').includes('json') || file.originalname.endsWith('.json')) {
      const parsed = JSON.parse(file.buffer.toString('utf8'));
      records = Array.isArray(parsed) ? parsed : (parsed.items || []);
    } else {
      records = parseCSV(file.buffer);
    }

    let imported = 0, failed = 0;
    const failures: string[] = [];
    wb_import_total.inc(records.length);

    for (let i=0;i<records.length;i++) {
      const rec = records[i];
      const err = validate(entity, rec);
      if (err) {
        failed++; wb_import_fail_total.inc();
        const id = `dlq-${Date.now()}-${i}`;
        dlq.push({ id, entity, error: err, record: rec, tenant_id: tenant, ts: Date.now(), source: 'import' });
        failures.push(id);
        continue;
      }
      if (!dry) {
        if (entity==='contacts') st.contacts.push({ id: `c_${Date.now()}_${i}`, ...rec, tenant_id: tenant });
        if (entity==='opportunities') st.opportunities.push({ id: `o_${Date.now()}_${i}`, ...rec, tenant_id: tenant });
      }
      imported++;
    }

    res.json({ entity, imported, failed, failures, dry_run: dry });
  } catch (e) { next(e); }
});

importExportRouter.get('/export', async (req, res, next) => {
  try {
    const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
    const entity = String(req.query.entity || 'contacts') as Entity;
    const fmt = String(req.query.format || 'json');
    const st = storeFor(tenant);
    const items = entity==='contacts' ? st.contacts : st.opportunities;
    wb_export_total.inc();

    if (fmt==='csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', f'attachment; filename="{entity}.csv"');
      res.send(toCSV(items));
    } else {
      res.json({ items, next_cursor: null });
    }
  } catch (e) { next(e); }
});

importExportRouter.get('/dlq', (req, res) => {
  const n = parseInt(String(req.query.n || '50'), 10);
  res.json({ items: dlq.slice(-n).reverse() });
});

importExportRouter.post('/dlq/replay', (req, res) => {
  const ids: string[] = (req.body && Array.isArray(req.body.ids)) ? req.body.ids : [];
  let replayed = 0;
  for (const id of ids) {
    const idx = dlq.findIndex(x => x.id === id);
    if (idx >= 0) { dlq.splice(idx,1); replayed++; }
  }
  res.json({ replayed });
});
