// Workbuoy server (mounts + health routes). Exports `app` for tests; runtime listen in src/bin/www.ts
import express from 'express';

const app = express();
app.use(express.json());

// Minimal requestContext to ensure a correlationId exists
app.use((req: any, _res, next) => {
  const cid = (req.headers['x-correlation-id'] as string) || Math.random().toString(36).slice(2);
  (req as any).wb = { ...(req as any).wb, correlationId: cid };
  next();
});

// Helper to conditionally mount routers if present
function safeMount(path: string, modPath: string, factory?: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(modPath);
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
safeMount('/buoy', './src/routes/buoy.complete', 'buoyRouter');
safeMount('/api/insights', './src/routes/insights', 'insightsRouter');
safeMount('/api/finance', './src/routes/finance.reminder', 'financeReminderRouter');
safeMount('/api', './src/routes/manual.complete', 'manualCompleteRouter');

// Debug-only mounts (optional)
if (process.env.NODE_ENV !== 'production') {
  safeMount('/api', './src/routes/debug.dlq', 'debugDlqRouter');
  safeMount('/api', './src/routes/debug.circuit', 'debugCircuitRouter');
}

// Health / readiness / build
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/readyz', (_req, res) => res.json({ ok: true }));
app.get('/buildz', (_req, res) => res.json({
  version: process.env.BUILD_VERSION || 'dev',
  commit: process.env.BUILD_COMMIT || 'dev',
  buildTime: process.env.BUILD_TIME || new Date().toISOString()
}));

// Basic error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || 'internal_error' });
});

export default app;
