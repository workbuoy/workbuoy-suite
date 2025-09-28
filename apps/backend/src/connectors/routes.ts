import express from 'express';
import { crm_webhook_success_total, crm_webhook_error_total } from '../metrics/metrics.js';

export const connectorsRouter = express.Router();

connectorsRouter.post('/api/v1/connectors/:provider/webhook', (req, res) => {
  const provider = String(req.params.provider || 'unknown');
  const forceError = req.query.error === '1' || req.header('x-force-error') === '1';
  if (forceError) {
    crm_webhook_error_total.labels(provider).inc();
    return res.status(500).json({ error: 'forced error' });
  }
  crm_webhook_success_total.labels(provider).inc();
  res.status(202).json({ enqueued: true, provider });
});
