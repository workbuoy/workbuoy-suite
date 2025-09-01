import client from 'prom-client';

export const wb_connector_ingest_total = new client.Counter({
  name: 'wb_connector_ingest_total',
  help: 'Number of records ingested from provider webhooks/polling',
  labelNames: ['provider','mode'] as const,
});

export const wb_connector_errors_total = new client.Counter({
  name: 'wb_connector_errors_total',
  help: 'Number of connector errors',
  labelNames: ['provider','mode'] as const,
});

export const wb_connector_retries_total = new client.Counter({
  name: 'wb_connector_retries_total',
  help: 'Number of connector retries',
  labelNames: ['provider'] as const,
});
