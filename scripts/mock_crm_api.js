// Minimal mock CRM for quickstart
import express from 'express';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 45860;
const db = { contacts: {} };

app.post('/api/v1/crm/contacts', (req, res) => {
  const id = randomUUID();
  const rec = { id, ...req.body, created_at: Date.now(), updated_at: Date.now() };
  db.contacts[id] = rec;
  res.status(201).json(rec);
});

app.get('/api/v1/crm/contacts/:id', (req, res) => {
  const c = db.contacts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not_found' });
  res.json(c);
});

app.patch('/api/v1/crm/contacts/:id', (req, res) => {
  const c = db.contacts[req.params.id];
  if (!c) return res.status(404).json({ error: 'not_found' });
  Object.assign(c, req.body, { updated_at: Date.now() });
  res.json(c);
});

// Webhook stub
app.post('/webhook', (req, res) => {
  console.log('[webhook]', JSON.stringify(req.body));
  res.status(204).end();
});

app.listen(PORT, () => console.log('Mock CRM listening on :'+PORT));
