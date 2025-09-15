
import express from 'express';
import { requestLogger } from './core/logging/logger';
import { metricsRouter } from './core/http/routes/debug.metrics';

const app = express();

// Minimal request context (correlationId/autonomy/role) for logs
app.use((req: any, _res, next) => {
  req.wb = req.wb || {};
  req.wb.correlationId = req.wb.correlationId || (globalThis.crypto?.randomUUID?.() || String(Date.now()));
  req.wb.roleId = req.headers['x-role-id'] || 'user';
  req.wb.autonomyLevel = Number(req.headers['x-autonomy-level'] || 2);
  next();
});

app.use(express.json());
app.use(requestLogger());

// Debug routes (metrics + DLQ)
app.use(metricsRouter());

// Health endpoints
app.get('/healthz', (_req, res) => res.json({ ok:true }));
app.get('/readyz', (_req, res) => res.json({ ok:true, bus:true, stores:true }));
app.get('/buildz', (_req, res) => res.json({
  version: process.env.BUILD_VERSION || 'dev',
  commit: process.env.BUILD_COMMIT || 'local',
  buildTime: process.env.BUILD_TIME || new Date().toISOString()
}));

// Placeholder feature routes (keep existing project routes alongside)
app.get('/api/crm/contacts', (_req, res) => res.json([]));
app.get('/api/tasks', (_req, res) => res.json([]));
app.get('/api/logs', (_req, res) => res.json([]));

// Error handler (safe)
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || 'Internal Error' });
});

export default app;
