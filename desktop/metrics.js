
const http = require('http');
const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const sessions = new client.Counter({ name: 'wb_desktop_sessions_total', help: 'App launches', registers: [register] });
const notifications = new client.Counter({ name: 'wb_desktop_notifications_total', help: 'Native notifications', registers: [register] });
const syncTotal = new client.Counter({ name: 'wb_desktop_sync_total', help: 'Sync cycles', registers: [register] });
const syncErr = new client.Counter({ name: 'wb_desktop_err_total', help: 'Sync errors', registers: [register] });
const cacheWrites = new client.Counter({ name: 'wb_desktop_cache_writes_total', help: 'Rows written to cache', registers: [register] });
const cacheConflicts = new client.Counter({ name: 'wb_desktop_cache_conflicts_total', help: 'Cache conflicts on upsert', registers: [register] });
const syncPages = new client.Counter({ name: 'wb_desktop_sync_pages_total', help: 'Pages fetched during sync', registers: [register] });
const syncRateLimited = new client.Counter({ name: 'wb_desktop_sync_rate_limited_total', help: 'Times sync was rate limited (HTTP 429)', registers: [register] });
const tokenRenews = new client.Counter({ name: 'wb_desktop_token_renews_total', help: 'Token renew operations performed', registers: [register] });
const aiRequests = new client.Counter({ name: 'wb_desktop_ai_requests_total', help: 'Buoy AI requests', registers: [register] });
const aiWorkflows = new client.Counter({ name: 'wb_desktop_ai_workflows_total', help: 'Buoy AI workflow requests', registers: [register] });
const crmNotifications = new client.Counter({ name: 'wb_desktop_crm_notifications_total', help: 'CRM desktop notifications', registers: [register] });
const offlineConflicts = new client.Counter({ name: 'wb_desktop_offline_conflicts_total', help: 'Offline conflicts detected on resync', registers: [register] });
const crmWrites = new client.Counter({ name: 'wb_desktop_crm_writes_total', help: 'CRM writes synced to server', registers: [register] });
const crmConflictResolutions = new client.Counter({ name: 'wb_desktop_crm_conflict_resolutions_total', help: 'Conflicts resolved by user', registers: [register] });
const aiAssistantSessions = new client.Counter({ name: 'wb_desktop_ai_assistant_sessions_total', help: 'AI assistant sessions started', registers: [register] });
const emailDrafts = new client.Counter({ name: 'wb_desktop_email_drafts_total', help: 'Email drafts created', registers: [register] });
const calendarEvents = new client.Counter({ name: 'wb_desktop_calendar_events_total', help: 'Calendar events created', registers: [register] });
const aiWorkflowsMulti = new client.Counter({ name: 'wb_desktop_ai_workflows_total', help: 'AI multi-step workflows started', registers: [register] });
const aiWorkflowsCompleted = new client.Counter({ name: 'wb_desktop_ai_workflows_completed_total', help: 'AI multi-step workflows completed', registers: [register] });
const aiWorkflowsFailed = new client.Counter({ name: 'wb_desktop_ai_workflows_failed_total', help: 'AI multi-step workflows failed', registers: [register] });
const orgsTotal = new client.Gauge({ name: 'wb_desktop_orgs_total', help: 'Total orgs configured', registers: [register] });
const orgSwitches = new client.Counter({ name: 'wb_desktop_org_switches_total', help: 'Org switch actions', registers: [register] });
const pluginHealthFailures = new client.Counter({ name: 'wb_desktop_plugin_health_failures_total', help: 'Plugin healthcheck failures', registers: [register] });
const pluginsEnabledTotal = new client.Gauge({ name: 'wb_desktop_plugins_enabled_total', help: 'Plugins enabled total', registers: [register] });

// Histogram in milliseconds
const syncDuration = new client.Histogram({
  name: 'wb_desktop_sync_duration_ms',
  help: 'Duration of a sync cycle in milliseconds',
  buckets: [50, 100, 250, 500, 1000, 2000, 5000, 10000],
  registers: [register],
  labelNames: ['endpoint', 'result']
});

function startMetricsServer(port = 9464) {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      try {
        const metrics = await register.metrics();
        res.writeHead(200, { 'Content-Type': register.contentType });
        res.end(metrics);
      } catch (e) {
        res.writeHead(500);
        res.end(e.message);
      }
      return;
    }
    res.writeHead(404);
    res.end('Not Found');
  });
  server.listen(port, '127.0.0.1', () => console.log(`[metrics] http://127.0.0.1:${port}/metrics`));
}

module.exports = {
  register,
  startMetricsServer,
  incSession: () => sessions.inc(),
  incNotification: () => notifications.inc(),
  incSync: () => syncTotal.inc(),
  incSyncErr: () => syncErr.inc(),
  incCacheWrites: (n = 1) => cacheWrites.inc(n),
  incCacheConflicts: (n = 1) => cacheConflicts.inc(n),
  incSyncPages: (n = 1) => syncPages.inc(n),
  incRateLimited: (n = 1) => syncRateLimited.inc(n),
  incTokenRenews: (n = 1) => tokenRenews.inc(n),
  incAIRequests: (n = 1) => aiRequests.inc(n),
  incAIWorkflows: (n = 1) => aiWorkflows.inc(n),
  incCRMNotifications: (n = 1) => crmNotifications.inc(n),
  incOfflineConflicts: (n = 1) => offlineConflicts.inc(n),
  incCRMWrites: (n = 1) => crmWrites.inc(n),
  incCRMConflictResolutions: (n = 1) => crmConflictResolutions.inc(n),
  incAIAssistantSessions: (n = 1) => aiAssistantSessions.inc(n),
  incEmailDrafts: (n = 1) => emailDrafts.inc(n),
  incCalendarEvents: (n = 1) => calendarEvents.inc(n),
  incAIWorkflows: (n = 1) => aiWorkflowsMulti.inc(n),
  incAIWorkflowsCompleted: (n = 1) => aiWorkflowsCompleted.inc(n),
  incAIWorkflowsFailed: (n = 1) => aiWorkflowsFailed.inc(n),
  setOrgsTotal: (n) => orgsTotal.set(n),
  incOrgSwitches: (n = 1) => orgSwitches.inc(n),
  incPluginHealthFailures: (n = 1) => pluginHealthFailures.inc(n),
  setPluginsEnabledTotal: (n) => pluginsEnabledTotal.set(n),
  observeSyncDuration: (ms, labels={endpoint:'unknown', result:'ok'}) => syncDuration.labels(labels.endpoint, labels.result).observe(ms)
};


const conflictsTotal = new client.Counter({ name: 'wb_desktop_conflicts_total', help: 'Total conflicts detected', registers: [register] });
const pluginsTotal = new client.Gauge({ name: 'wb_desktop_plugins_total', help: 'Plugins count by status', labelNames: ['status'], registers: [register] });
const aiJobsTotal = new client.Counter({ name: 'wb_desktop_ai_jobs_total', help: 'AI jobs by status', labelNames: ['status'], registers: [register] });

module.exports = {
  ...module.exports,
  incConflicts: (n = 1) => conflictsTotal.inc(n),
  setPluginsTotal: (status, n) => pluginsTotal.labels(status).set(n),
  incAIJobs: (status, n = 1) => aiJobsTotal.labels(status).inc(n)
};


const invalidIPC = new client.Counter({ name: 'invalid_ipc_total', help: 'Number of rejected IPC calls', registers: [register] });
module.exports.incInvalidIPC = (n=1)=> invalidIPC.inc(n);


const pluginSigFailures = new client.Counter({ name: 'wb_desktop_plugin_signature_failures_total', help: 'Plugin signature verification failures', registers: [register] });
module.exports.incPluginSignatureFailures = (n=1)=> pluginSigFailures.inc(n);

const auditPush = new client.Counter({ name: 'wb_desktop_audit_push_total', help: 'Audit push results', labelNames: ['status'], registers: [register] });
const auditQueueSize = new client.Gauge({ name: 'wb_desktop_audit_queue_size', help: 'Audit queue size', registers: [register] });
module.exports.incAuditPush = (status, n=1)=> auditPush.labels(status).inc(n);
module.exports.setAuditQueueSize = (n)=> auditQueueSize.set(n);

const crdtResolutions = new client.Counter({ name: 'wb_desktop_crdt_resolutions_total', help: 'CRDT conflict resolutions', registers: [register] });
const crdtResolutionTime = new client.Histogram({ name: 'wb_desktop_conflict_resolution_time_ms', help: 'Conflict resolution time (ms)', buckets:[5,10,20,50,100,200,500,1000], registers: [register] });
module.exports.incCRDT = (n=1)=> crdtResolutions.inc(n);
module.exports.observeResolutionTime = (ms)=> crdtResolutionTime.observe(ms);
