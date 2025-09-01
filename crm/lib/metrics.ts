import client from 'prom-client';

function getOrCreate<T extends client.Metric<any>>(name: string, factory: () => T): T{
  const ex = (client.register as any).getSingleMetric(name) as T | undefined;
  return ex || factory();
}

export function apiLatency(){
  return getOrCreate('wb_http_request_duration_seconds', () => new client.Histogram({
    name: 'wb_http_request_duration_seconds',
    help: 'HTTP request duration histogram',
    labelNames: ['route','method','status'],
    buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2,5]
  }));
}

export function httpRequestsTotal(){
  return getOrCreate('wb_http_requests_total', () => new client.Counter({
    name: 'wb_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['route','method','status']
  }));
}

export function pipelineEventsTotal(){
  return getOrCreate('wb_crm_pipeline_events_total', () => new client.Counter({
    name: 'wb_crm_pipeline_events_total',
    help: 'Pipeline events (webhooks) total',
    labelNames: ['event','source']
  }));
}

export function syncErrorsTotal(){
  return getOrCreate('wb_crm_sync_errors_total', () => new client.Counter({
    name: 'wb_crm_sync_errors_total',
    help: 'Sync errors total',
    labelNames: ['source']
  }));
}

export function ingestRetriesTotal(){
  return getOrCreate('wb_ingest_retries_total', () => new client.Counter({
    name: 'wb_ingest_retries_total',
    help: 'Ingest retries',
    labelNames: ['adapter']
  }));
}

export function ingestPayloadBytes(){
  return getOrCreate('wb_ingest_payload_bytes', () => new client.Histogram({
    name: 'wb_ingest_payload_bytes',
    help: 'Ingest payload size (bytes)',
    labelNames: ['adapter'],
    buckets: [64,128,256,512,1024,2048,4096,8192,16384,32768]
  }));
}
