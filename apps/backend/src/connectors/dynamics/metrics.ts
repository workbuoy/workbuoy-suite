import client from 'prom-client';

export const dyn_ingest_total = new client.Counter({
  name: 'dyn_ingest_total',
  help: 'Dynamics records ingested',
  labelNames: ['object','mode'] as const
});

export const dyn_errors_total = new client.Counter({
  name: 'dyn_errors_total',
  help: 'Dynamics connector errors',
  labelNames: ['stage'] as const
});

export const dyn_dlq_total = new client.Counter({
  name: 'dyn_dlq_total',
  help: 'Dynamics connector DLQ count',
  labelNames: ['reason'] as const
});
