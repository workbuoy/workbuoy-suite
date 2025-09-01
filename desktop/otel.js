const { context, trace } = require('@opentelemetry/api');
const { BasicTracerProvider, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

let started = false;
function start() {
  if (started) return;
  const url = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.WB_OTEL_TRACES_URL;
  if (!url) { started = true; return; }
  const provider = new BasicTracerProvider({
    resource: new Resource({
      'service.name': 'workbuoy-desktop',
      'service.version': process.env.npm_package_version || 'dev',
      'service.instance.id': require('node:os').hostname()
    })
  });
  provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter({ url })));
  provider.register();
  started = true;
}

function span(name, fn) {
  const tracer = trace.getTracer('wb-desktop');
  return tracer.startActiveSpan(name, (sp)=> {
    try { const res = fn(sp); sp.end(); return res; }
    catch (e) { sp.recordException(e); sp.end(); throw e; }
  });
}

module.exports = { start, span };
