import app from './server.js';
import { startMetricsBridge } from './observability/metricsBridge.js';

const metricsEnabled = String(process.env.METRICS_ENABLED ?? 'false').toLowerCase() === 'true';

if (metricsEnabled) {
  startMetricsBridge();
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`[workbuoy] backend listening on :${port}`);
});
