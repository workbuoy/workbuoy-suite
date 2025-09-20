// Workbuoy server (mounts + health routes). Exports `app` for tests; runtime listen in src/bin/www.ts
import express from 'express';
import { correlationHeader } from './middleware/correlationHeader';
import { wbContext } from './middleware/wbContext';
import { requestLogger } from './core/logging/logger';
import { timingMiddleware, metricsHandler } from './core/observability/metrics';
import { errorHandler } from './core/http/middleware/errorHandler';
import { debugBusHandler } from './routes/_debug.bus';
import knowledgeRouter from './routes/knowledge.router';
import { auditRouter } from './routes/audit';
import { bus } from './core/eventBusV2';

const app = express();
app.use(express.json());
app.use(correlationHeader);
app.use(wbContext);
app.use(timingMiddleware);
app.use(requestLogger());

function loadModule(modPath: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(modPath);
  } catch (err: any) {
    if (modPath.startsWith('./src/') && err?.code === 'MODULE_NOT_FOUND') {
      const fallback = modPath.replace('./src/', './');
      if (fallback !== modPath) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(fallback);
      }
    }
    throw err;
  }
}

// Helper to conditionally mount routers if present
function safeMount(path: string, modPath: string, factory?: string) {
  try {
    const mod = loadModule(modPath);
    const router = factory ? (mod[factory] ? mod[factory]() : null) : (mod.default || mod.router || null);
    if (router) {
      app.use(path, router);
      console.log(`[server] mounted ${modPath} -> ${path}`);
    }
  } catch (e) {
    // missing module is fine in delta mode
  }
}

// Feature routers (mounted only if files exist in repo)
safeMount('/api/crm/contacts', './src/features/crm/routes', 'crmRouter');
safeMount('/api/tasks', './src/features/tasks/routes', 'tasksRouter');
safeMount('/api/logs', './src/features/log/routes', 'logRouter');
safeMount('/api', './src/features/deals/deals.router');
safeMount('/buoy', './src/routes/buoy.complete', 'buoyRouter');
safeMount('/api/insights', './src/routes/insights', 'insightsRouter');
safeMount('/api/finance', './src/routes/finance.reminder', 'financeReminderRouter');
safeMount('/api', './src/routes/manual.complete', 'manualCompleteRouter');
safeMount('/', './src/routes/genesis.autonomy', 'metaGenesisRouter');
safeMount('/api', '../backend/routes/usage');
safeMount('/api', '../backend/routes/features');
safeMount('/api', '../backend/routes/proactivity');
safeMount('/api', '../backend/routes/admin.subscription');
safeMount('/api', '../backend/routes/admin.roles');
safeMount('/api', '../backend/routes/explainability');

app.use('/api', knowledgeRouter);
app.use('/api/audit', auditRouter());

// Debug-only mounts (optional)
if (process.env.NODE_ENV !== 'production') {
  safeMount('/api', './src/routes/debug.dlq', 'debugDlqRouter');
  safeMount('/api', './src/routes/debug.circuit', 'debugCircuitRouter');
  safeMount('/api', '../backend/routes/dev.runner');
}

// Operability surfaces
app.get('/metrics', metricsHandler);

app.get('/status', async (_req, res) => {
  try {
    const stats = await bus.stats();
    const summary = stats.summary ?? { high: 0, medium: 0, low: 0, dlq: 0 };
    res.json({
      ok: true,
      ts: new Date().toISOString(),
      persistMode: (process.env.PERSIST_MODE || 'file').toLowerCase(),
      queues: summary
    });
  } catch (err: any) {
    res.status(500).json({ error: 'status_unavailable', message: err?.message || String(err) });
  }
});

app.get('/_debug/bus', debugBusHandler);
// Health / readiness / build
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/readyz', (_req, res) => res.json({ ok: true }));
app.get('/buildz', (_req, res) => res.json({
  version: process.env.BUILD_VERSION || 'dev',
  commit: process.env.BUILD_COMMIT || 'dev',
  buildTime: process.env.BUILD_TIME || new Date().toISOString()
}));

// Basic error handler
app.use(errorHandler);

export default app;
