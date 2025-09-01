
// Custom metrics for Data Quality, Integration health, and Batch Scoring
import client from 'prom-client';

let initialized = false;
export let METRICS = {};
export function registerDataIntegrationMetrics(reg){
  if(initialized) return METRICS;
  const wb_data_quality_suggested_total = new client.Counter({ name:'wb_data_quality_suggested_total', help:'Total data quality suggestions' });
  const wb_data_quality_applied_total = new client.Counter({ name:'wb_data_quality_applied_total', help:'Total data quality suggestions applied' });
  const wb_data_quality_failed_total = new client.Counter({ name:'wb_data_quality_failed_total', help:'Failed apply count', labelNames:['reason'] });
  const wb_data_quality_confidence_histogram = new client.Histogram({ name:'wb_data_quality_confidence_histogram', help:'Confidence distribution', buckets:[0.5,0.6,0.7,0.8,0.85,0.9,0.95,1.0] });

  const wb_integration_circuit_open = new client.Counter({ name:'wb_integration_circuit_open', help:'Circuit opened', labelNames:['connector'] });
  const wb_retry_queue_depth = new client.Gauge({ name:'wb_retry_queue_depth', help:'Retry queue depth', labelNames:['connector'] });
  const wb_dlq_depth = new client.Gauge({ name:'wb_dlq_depth', help:'DLQ depth', labelNames:['connector'] });
  const wb_signal_batch_latency_ms = new client.Histogram({ name:'wb_signal_batch_latency_ms', help:'Batch latency ms', buckets:[10,20,50,80,120,200,400,800] });
  const wb_scoring_p95_ms = new client.Gauge({ name:'wb_scoring_p95_ms', help:'Scoring p95 ms' });

  [wb_data_quality_suggested_total, wb_data_quality_applied_total, wb_data_quality_failed_total, wb_data_quality_confidence_histogram, wb_integration_circuit_open, wb_retry_queue_depth, wb_dlq_depth, wb_signal_batch_latency_ms, wb_scoring_p95_ms].forEach(m=>{
    try{ reg.registerMetric(m); }catch{}
    try{ client.register.registerMetric(m); }catch{}
  });

  METRICS = { wb_data_quality_suggested_total, wb_data_quality_applied_total, wb_data_quality_failed_total, wb_data_quality_confidence_histogram, wb_integration_circuit_open, wb_retry_queue_depth, wb_dlq_depth, wb_signal_batch_latency_ms, wb_scoring_p95_ms };
  initialized = true;
  return METRICS;
}
