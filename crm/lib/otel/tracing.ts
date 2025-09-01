import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const exporter = new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces' });
const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [ new HttpInstrumentation(), getNodeAutoInstrumentations() ]
});
sdk.start().then(()=>{
  console.log('[OTEL] tracing started');
}).catch(err=> console.warn('[OTEL] tracing failed', err));
