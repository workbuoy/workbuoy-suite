import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

let provider: BasicTracerProvider | null = null;

export function initOtel() {
  if (process.env.DESKTOP_OTEL_ENABLED === 'false') return;
  provider = new BasicTracerProvider();
  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
  });
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();
  console.log('[OTEL] Tracer initialized');
}

export function withSpan<T>(name: string, fn: ()=>Promise<T>): Promise<T> {
  const tracer = trace.getTracer('workbuoy-desktop');
  const span = tracer.startSpan(name);
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err:any) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw err;
    } finally {
      span.end();
    }
  });
}
