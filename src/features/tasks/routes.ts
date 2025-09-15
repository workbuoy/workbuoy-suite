import { Router } from 'express';
import { InMemoryTasksRepo } from './repo';
import { policyGuardWrite } from '../../core/policy/guard';

export function tasksRouter() {
  const r = Router();
  r.get('/', async (_req, res)=> res.json(await InMemoryTasksRepo.list()));
  r.post('/', policyGuardWrite('tasks'), async (req: any, res, next)=>{
    try {
      const { title, status='todo', assignee, dueDate } = req.body || {};
      if (!title) return res.status(400).json({ error: 'title required' });
      const row = await InMemoryTasksRepo.create({ title, status, assignee, dueDate } as any);
      res.status(201).json(row);
    } catch (e) { next(e); }
  });
  r.patch('/:id', policyGuardWrite('tasks'), async (req, res, next)=>{
    try { const row = await InMemoryTasksRepo.update(String(req.params.id), req.body || {}); res.json(row); }
    catch (e) { next(e); }
  });
  r.delete('/:id', policyGuardWrite('tasks'), async (req, res, next)=>{
    try { await InMemoryTasksRepo.remove(String(req.params.id)); res.status(204).send(); }
    catch (e) { next(e); }
  });
  return r;
}
