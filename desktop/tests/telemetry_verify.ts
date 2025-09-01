import { startMockOTLP } from '../tools/otel/mock_otlp.js';
import { span } from '../src/telemetry/otel.js';

(async () => {
  const mock = startMockOTLP(4318);
  process.env.OTLP_HTTP_URL = 'http://127.0.0.1:4318/v1/traces';
  await span('test.span', { k: 'v' });
  await span('test.span2', { ok: true });
  await mock.stop();
  const n = mock.getCount();
  if (n < 2) { console.error('Expected >=2 spans, got', n); process.exit(1); }
  console.log('Telemetry PASS spans=', n);
  process.exit(0);
})();
