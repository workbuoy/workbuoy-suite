import { Router } from 'express';
import { policyV2Guard as policyGuard } from '../../core/policyV2/guard';
import * as repo from './tasks.store';
import bus from '../../core/events/priorityBus';
import { append } from '../../core/audit/immutableLog';

const router = Router();

router.get('/', (_req, res)=>{ res.json({ items: repo.list() }); });

router.post('/', policyGuard, (req, res)=>{
  const { title, status = 'todo', assignee, dueDate } = req.body || {};
  if (!title) return res.status(400).json({ error:{ code:'E_VALIDATION', message:'title required' } });
  const item = repo.create({ title, status, assignee, dueDate });
  bus.emit({ type:'task.created', priority:'high', payload:{ id: item.id } });
  append(req.wb?.correlationId || 'unknown','task.created', { id: item.id });
  res.status(201).json(item);
});

router.patch('/:id', policyGuard, (req, res)=>{
  const next = repo.update(req.params.id, req.body || {});
  if (!next) return res.status(404).json({ error:{ code:'E_NOT_FOUND', message:'task not found' } });
  bus.emit({ type:'task.changed', priority:'high', payload:{ id: next.id } });
  append(req.wb?.correlationId || 'unknown','task.changed', { id: next.id });
  res.json(next);
});

router.delete('/:id', policyGuard, (req, res)=>{
  const ok = repo.remove(req.params.id);
  if (!ok) return res.status(404).json({ error:{ code:'E_NOT_FOUND', message:'task not found' } });
  bus.emit({ type:'task.deleted', priority:'high', payload:{ id: req.params.id } });
  append(req.wb?.correlationId || 'unknown','task.deleted', { id: req.params.id });
  res.status(204).end();
});

export default router;
