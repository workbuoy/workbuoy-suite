
import { Router } from 'express';
import { PriorityBus } from '../../events/priorityBus';

export function metricsRouter() {
  const r = Router();
  r.get('/api/_debug/metrics', (_req, res) => res.json({ bus: PriorityBus.stats() }));
  r.get('/api/_debug/dlq', (_req, res) => res.json({ dlq: PriorityBus.dlqList() }));
  return r;
}
