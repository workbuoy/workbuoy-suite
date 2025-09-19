import { Router } from 'express';
import { CRMRepo } from './repo';
import { policyGuardWrite } from '../../core/policy/guard';

export function crmRouter() {
  const r = Router();
  // GET list
  r.get('/contacts', async (_req, res) => {
    const rows = await CRMRepo.list();
    res.json(rows);
  });
  // POST create (write policy)
  r.post('/contacts', policyGuardWrite('crm.contacts'), async (req: any, res, next) => {
    try {
      const { id, name, email, phone } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name required' });
      const row = await CRMRepo.create({ id, name, email, phone });
      res.status(201).json(row);
    } catch (e) { next(e); }
  });
  // DELETE remove (write policy)
  r.delete('/contacts/:id', policyGuardWrite('crm.contacts'), async (req, res, next) => {
    try { await CRMRepo.remove(String(req.params.id)); res.status(204).send(); }
    catch (e) { next(e); }
  });
  return r;
}
