// src/routes/knowledge.router.ts
import { Router } from 'express';
import { getKnowledgeIndex } from '../core/knowledge/index';
const r = Router();
r.get('/knowledge/search', async (req, res) => {
  const q = String(req.query.q || '');
  const idx = getKnowledgeIndex();
  const results = await idx.search(q);
  res.json({ results });
});
export default r;
