import client from 'prom-client';

export const sf_ingest_total = new client.Counter({
  name: 'sf_ingest_total',
  help: 'Salesforce records ingested',
  labelNames: ['object','mode'] as const
});

export const sf_errors_total = new client.Counter({
  name: 'sf_errors_total',
  help: 'Salesforce connector errors',
  labelNames: ['stage'] as const
});

export const sf_dlq_total = new client.Counter({
  name: 'sf_dlq_total',
  help: 'Salesforce connector DLQ count',
  labelNames: ['reason'] as const
});
