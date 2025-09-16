// src/routes/knowledge.router.ts
import { Router } from 'express';
const r = Router();

r.get('/knowledge/search', async (req, res) => {
  const q = String(req.query.q || '');
  const results = q ? [{ id: 'stub', title: q, snippet: '', score: 0.1 }] : [];
  res.json({ results });
});

export default r;
