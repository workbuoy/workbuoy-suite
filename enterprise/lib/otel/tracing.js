import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

let started = false;
export function initTracing(){
  if(started) return;
  if(!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
    instrumentations: [ getNodeAutoInstrumentations() ]
  });
  sdk.start(); started = true;
}
