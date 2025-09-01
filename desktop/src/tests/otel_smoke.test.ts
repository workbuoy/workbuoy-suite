import { initTelemetry, startSpan } from '../telemetry/otel.js';

await (async () => {
  initTelemetry();
  const span = startSpan('test.span');
  span.end();
})();
