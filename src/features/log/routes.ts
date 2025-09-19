import { Router } from 'express';
import { LogRepo } from './repo';
import { policyGuardWrite } from '../../core/policy/guard';

export function logRouter() {
  const r = Router();
  r.get('/', async (req: any, res)=> {
    const limit = Number(req.query.limit || 100);
    res.json(await LogRepo.list(limit));
  });
  r.post('/', policyGuardWrite('log'), async (req: any, res, next)=>{
    try {
      const wb = req.wb || {};
      const { level='info', message } = req.body || {};
      const row = await LogRepo.append({ level, message, correlationId: wb.correlationId });
      res.status(201).json(row);
    } catch (e) { next(e); }
  });
  return r;
}
