import client from 'prom-client';
import { wb_connector_errors_total, wb_connector_ingest_total, wb_connector_retries_total } from '../connectors/metrics.js';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Register connector metrics
register.registerMetric(wb_connector_ingest_total);
register.registerMetric(wb_connector_errors_total);
register.registerMetric(wb_connector_retries_total);

export { register };
