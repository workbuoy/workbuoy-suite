import { Router } from 'express';
import { crm_pipeline_transitions_total } from '../metrics/metrics.js';

export const crmRouter = Router();

// Attach latency middleware at app-level; here only business route:
crmRouter.post('/api/v1/crm/pipelines/:pipelineId/transitions', (req, res) => {
  const pipelineId = String(req.params.pipelineId);
  const from_stage = String(req.body.from_stage || '');
  const to_stage = String(req.body.to_stage || '');
  if (!from_stage || !to_stage) return res.status(400).json({ error: 'from_stage and to_stage required' });
  crm_pipeline_transitions_total.labels(pipelineId, from_stage, to_stage).inc();
  res.status(204).end();
});

// Example GET to exercise latency metric
crmRouter.get('/api/v1/crm/contacts', (_req, res) => {
  res.json({ items: [] });
});
