import { initTelemetry, startSpan } from '../telemetry/otel.js';

(async () => {
  initTelemetry();
  const span = startSpan('test.span');
  span.end();
})();
