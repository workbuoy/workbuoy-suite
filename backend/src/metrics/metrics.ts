import { Router } from 'express';
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const crm_api_latency_ms = new client.Histogram({
  name: 'crm_api_latency_ms',
  help: 'Latency for CRM API endpoints (ms)',
  labelNames: ['method','route','status'] as const,
  buckets: [10,25,50,100,200,500,1000,2000],
  registers: [register],
});

export const audit_events_total = new client.Counter({ name: 'audit_events_total', help: 'Audit events', registers: [register] });

export const metricsRouter = Router();
metricsRouter.get('/', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
