import { Router } from 'express';
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const crm_api_latency_ms = new client.Histogram({
  name: 'crm_api_latency_ms',
  help: 'Latency for CRM API endpoints (ms)',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [10, 25, 50, 100, 200, 500, 1000, 2000],
  registers: [register],
});

export const audit_events_total = new client.Counter({
  name: 'audit_events_total',
  help: 'Audit events',
  registers: [register],
});

export const wb_connector_retries_total = new client.Counter({
  name: 'wb_connector_retries_total',
  help: 'Connector retries triggered by the queue worker',
  registers: [register],
});

export const crm_webhook_success_total = new client.Counter({
  name: 'crm_webhook_success_total',
  help: 'Successful CRM webhook deliveries',
  registers: [register],
});

export const crm_webhook_error_total = new client.Counter({
  name: 'crm_webhook_error_total',
  help: 'Failed CRM webhook deliveries',
  registers: [register],
});

export const wb_import_total = new client.Counter({
  name: 'wb_import_total',
  help: 'Number of records imported via CRM bulk import',
  labelNames: ['entity'] as const,
  registers: [register],
});

export const wb_import_fail_total = new client.Counter({
  name: 'wb_import_fail_total',
  help: 'Number of CRM import failures',
  labelNames: ['entity'] as const,
  registers: [register],
});

export const wb_export_total = new client.Counter({
  name: 'wb_export_total',
  help: 'Number of CRM export operations executed',
  labelNames: ['entity'] as const,
  registers: [register],
});

export const crm_pipeline_transitions_total = new client.Counter({
  name: 'crm_pipeline_transitions_total',
  help: 'Pipeline stage transitions recorded',
  registers: [register],
});

export const rbac_denied_total = new client.Counter({
  name: 'rbac_denied_total',
  help: 'Denied RBAC checks',
  registers: [register],
});

export const rbac_policy_change_total = new client.Counter({
  name: 'rbac_policy_change_total',
  help: 'Policy change operations executed via admin routes',
  registers: [register],
});

export const metricsRouter = Router();
metricsRouter.get('/', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
