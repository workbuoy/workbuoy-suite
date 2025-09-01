'use strict';
const client = require('prom-client');
client.collectDefaultMetrics();

const histograms = {
  scheduler_cycle_latency: new client.Histogram({ name: 'wb_scheduler_cycle_seconds', help: 'Scheduler cycle latency (s)' }),
  connector_sync_latency: new client.Histogram({ name: 'wb_connector_sync_seconds', help: 'Connector sync latency (s)', labelNames: ['connector','tenant'] }),
};
const counters = {
  scheduler_skipped: new client.Counter({ name: 'wb_scheduler_skipped_total', help: 'Scheduler cycles skipped due to breaker' }),
  connector_sync_success: new client.Counter({ name: 'wb_connector_sync_success_total', help: 'Connector sync success', labelNames: ['connector','tenant'] }),
  connector_sync_failure: new client.Counter({ name: 'wb_connector_sync_failure_total', help: 'Connector sync failure', labelNames: ['connector','tenant'] }),
};

module.exports = { client, histograms, counters };

// PII masking counter
const pii_masked = new client.Counter({ name:'wb_pii_masked_total', help:'PII strings masked in AI prompts/answers' });
module.exports.counters.pii_masked = pii_masked;

// Freshness gauge: seconds since epoch of last successful sync
const gauges = {
  connector_last_success_ts: new client.Gauge({ name: 'wb_connector_last_success_timestamp', help: 'Last success unix ts', labelNames: ['connector','tenant'] }),
  ai_mask_ratio: new client.Histogram({ name: 'wb_ai_mask_ratio', help: 'Ratio of masked chars in prompts/answers (0..1)' }),
  ai_masked_chars_total: new client.Counter({ name: 'wb_ai_masked_chars_total', help: 'Total masked characters across prompts/answers' }),
};
module.exports = { client, histograms, counters, gauges };


// Generic connector counters
counters.connector_sync_total = new client.Counter({ name: 'wb_connector_sync_total', help: 'Connector sync attempts', labelNames: ['connector','tenant'] });
counters.connector_err_total = new client.Counter({ name: 'wb_connector_err_total', help: 'Connector sync errors', labelNames: ['connector','tenant'] });


// --- Added by Aug 2025 update: demo & stub metrics ---
try {
  const client = module.exports.client || require('prom-client');
  const _c = module.exports.counters || {};
  if(!_c.connector_stub_total){
    _c.connector_stub_total = new client.Counter({
      name: 'wb_connector_stub_total',
      help: 'Count of stubbed connector calls',
      labelNames: ['system']
    });
  }
  if(!_c.demo_dataset_enabled_total){
    _c.demo_dataset_enabled_total = new client.Counter({
      name: 'wb_demo_dataset_enabled_total',
      help: 'How many times demo dataset was enabled'
    });
  }
  module.exports.counters = Object.assign(module.exports.counters||{}, _c);
} catch(e) { /* noop for tests */ }


// Added for dev-ready: last sync gauge
try {
  const client2 = module.exports.client || require('prom-client');
  const g = (module.exports.gauges ||= {});
  if(!g.connector_last_sync){
    g.connector_last_sync = new client2.Gauge({
      name: 'wb_connector_last_sync',
      help: 'Last successful connector sync timestamp (unix seconds)',
      labelNames: ['connector','tenant']
    });
  }
} catch(_){}


try {
  const client2 = module.exports.client || require('prom-client');
  const c = (module.exports.counters ||= {});
  if(!c.admin_actions_total){
    c.admin_actions_total = new client2.Counter({ name:'wb_admin_actions_total', help:'Admin actions', labelNames:['action'] });
  }
  if(!c.scim_mutations_total){
    c.scim_mutations_total = new client2.Counter({ name:'wb_scim_mutations_total', help:'SCIM mutations', labelNames:['entity','op'] });
  }
  if(!c.pii_masked_chars_total){
    c.pii_masked_chars_total = new client2.Counter({ name:'wb_pii_masked_chars_total', help:'Masked characters total' });
  }
  module.exports.counters = c;
} catch(_){}
