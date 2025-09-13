import { Router } from 'express';
import { policyV2Guard as policyGuard } from '../../core/policyV2/guard';
import * as repo from './contacts.store';
import bus from '../../core/events/priorityBus';
import { append } from '../../core/audit/immutableLog';

const router = Router();

router.get('/', (_req, res)=>{
  res.json({ items: repo.list() });
});

router.post('/', policyGuard, (req, res, next)=>{
  try{
    const { name, email, phone } = req.body || {};
    if (!name) return res.status(400).json({ error: { code:'E_VALIDATION', message:'name required' } });
    const item = repo.create({ name, email, phone });
    bus.emit({ type:'crm.contact.created', priority:'medium', payload:{ id: item.id } });
    append(req.wb?.correlationId || 'unknown','crm.contact.created', { id: item.id });
    res.status(201).json(item);
  }catch(e){ next(e); }
});

router.delete('/:id', policyGuard, (req, res)=>{
  const ok = repo.remove(req.params.id);
  if (ok){
    bus.emit({ type:'crm.contact.deleted', priority:'low', payload:{ id: req.params.id } });
    append(req.wb?.correlationId || 'unknown','crm.contact.deleted', { id: req.params.id });
    return res.status(204).end();
  }
  return res.status(404).json({ error:{ code:'E_NOT_FOUND', message:'contact not found' } });
});

export default router;
