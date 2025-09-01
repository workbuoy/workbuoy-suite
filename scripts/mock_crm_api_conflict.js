import express from 'express';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 45890;

// state
const contacts = new Map();
const failureRate = Number(process.env.FAIL_RATE || 0.01); // 1% errors

// seed a conflict record
const seedId = 'conflict-1';
contacts.set(seedId, { id: seedId, name: 'Remote Contact', email:'remote@example.com', updated_at: Date.now() });

// endpoints
app.post('/api/v1/crm/contacts', (req,res)=>{
  if (Math.random() < failureRate) return res.status(500).json({ error:'flaky' });
  const body = req.body || {};
  const id = body.id || randomUUID();
  if (contacts.has(id)) return res.status(409).json({ error:'conflict', id });
  const now = Date.now();
  const rec = { id, ...body, updated_at: body.updated_at || now, created_at: now };
  contacts.set(id, rec);
  res.status(201).json(rec);
});

app.patch('/api/v1/crm/contacts/:id', (req,res)=>{
  const cur = contacts.get(req.params.id);
  if (!cur) return res.status(404).json({ error:'not_found' });
  const upd = { ...cur, ...req.body, updated_at: Date.now() };
  contacts.set(upd.id, upd);
  res.json(upd);
});

app.get('/_admin/contacts/:id', (req,res)=>{
  const rec = contacts.get(req.params.id);
  if (!rec) return res.status(404).json({ error:'not_found' });
  res.json(rec);
});

app.get('/health', (_req,res)=>res.json({ ok:true }));

app.listen(PORT, ()=>console.log('Mock CRM (conflict) on :'+PORT));
