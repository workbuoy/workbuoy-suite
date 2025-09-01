// Mock WorkBuoy Suite: CRM (contacts/opps) + compliance + metrics + webhook queue
import express from 'express';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 45870;

// In-memory
const db = { contacts: {}, opportunities: {}, webhooks: [] };
const metrics = {
  sf_ingest_total: 0,
  sf_errors_total: 0,
  sf_dlq_total: 0,
  dyn_ingest_total: 0,
  dyn_errors_total: 0,
  dyn_dlq_total: 0,
  crm_posts_total: 0,
  compliance_exports_total: 0
};

function connectorFrom(req){
  const c = String(req.header('x-connector') || '').toLowerCase();
  if (c === 'salesforce') return 'sf';
  if (c === 'dynamics') return 'dyn';
  return null;
}

app.get('/health', (_req,res)=>res.json({ ok:true }));

// CRM
app.post('/api/v1/crm/contacts', (req,res)=>{
  const id = randomUUID();
  const rec = { id, ...req.body, created_at: Date.now(), updated_at: Date.now() };
  db.contacts[id] = rec;
  metrics.crm_posts_total++;
  const c = connectorFrom(req);
  if (c === 'sf') metrics.sf_ingest_total++; else if (c === 'dyn') metrics.dyn_ingest_total++;
  res.status(201).json(rec);
});

app.get('/api/v1/crm/contacts/:id', (req,res)=>{
  const c = db.contacts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not_found' });
  res.json(c);
});

app.patch('/api/v1/crm/contacts/:id', (req,res)=>{
  const c = db.contacts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not_found' });
  Object.assign(c, req.body, { updated_at: Date.now() });
  res.json(c);
});

app.post('/api/v1/crm/opportunities', (req,res)=>{
  const id = randomUUID();
  const rec = { id, ...req.body, created_at: Date.now(), updated_at: Date.now() };
  db.opportunities[id] = rec;
  metrics.crm_posts_total++;
  const c = connectorFrom(req);
  if (c === 'sf') metrics.sf_ingest_total++; else if (c === 'dyn') metrics.dyn_ingest_total++;
  res.status(201).json(rec);
});

// Webhook stub + queue inspect
app.post('/webhook', (req,res)=>{
  db.webhooks.push({ ts: Date.now(), payload: req.body });
  res.status(204).end();
});
app.get('/_admin/webhooks', (_req,res)=>res.json(db.webhooks));

// Compliance (mock)
const exportJobs = new Map();
app.post('/api/v1/compliance/export', (req,res)=>{
  const userId = String(req.body?.userId || '');
  if (!userId) return res.status(400).json({ error:'userId required' });
  const jobId = randomUUID();
  exportJobs.set(jobId, { jobId, userId, status:'started' });
  metrics.compliance_exports_total++;
  db.webhooks.push({ ts: Date.now(), event: 'privacy.export.started', userId, jobId });
  res.status(202).json({ jobId, status:'started' });
});
app.get('/api/v1/compliance/export/:jobId', (req,res)=>{
  const job = exportJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error:'not_found' });
  if (job.status !== 'complete'){
    job.status='complete';
    job.url=`/downloads/export_${job.jobId}.json`;
    exportJobs.set(job.jobId, job);
    db.webhooks.push({ ts: Date.now(), event:'privacy.export.completed', userId: job.userId, jobId: job.jobId, url: job.url });
  }
  res.json(job);
});

// Prometheus metrics (text)
app.get('/metrics', (_req,res)=>{
  res.type('text/plain').send(
    Object.entries(metrics).map(([k,v])=>`${k} ${v}`).join('\n') + '\n'
  );
});

app.listen(PORT, ()=>console.log('Mock Suite API listening on :'+PORT));
