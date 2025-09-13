import express, { Request, Response, NextFunction } from 'express';

// Core middleware (assumed present in repo)
import requestContext from './core/http/middleware/requestContext';
import errorHandler from './core/http/middleware/errorHandler';

// Policy (aliased to v2 by earlier PRs)
import { policyGuard } from './core/policy';

// Feature routers (assumed present)
import crmRoutes from './features/crm/routes';
import tasksRoutes from './features/tasks/routes';
import logRoutes from './features/log/routes';

// Buoy endpoint (assumed present)
import buoyRoutes from './core/http/routes/buoy';

// Dev DLQ debug (added in PR3)
import dlqDebug from './core/http/routes/debug.dlq';

const app = express();

// 1) Request context first (correlationId, roleId, autonomyLevel, etc.)
app.use(requestContext);

// 2) Body parsing
app.use(express.json());

// 3) (Optional) route-local rate limit placeholder for write routes (can be replaced by express-rate-limit)
function writeRateLimit(_req: Request, _res: Response, next: NextFunction) { return next(); }

// 4) Routers (policyGuard should be applied inside each router on write paths)
app.use('/api/crm/contacts', crmRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/logs', logRoutes);

// 5) Buoy API
app.use('/buoy', buoyRoutes);

// 6) Health/ready/build
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
app.get('/readyz', (_req, res) => {
  // Minimal readiness checks; extend with bus/store checks
  return res.status(200).json({ ok: true, bus: 'up' });
});
app.get('/buildz', (_req, res) => {
  const { VERSION, COMMIT, BUILD_TIME } = process.env as any;
  res.status(200).json({
    version: VERSION || 'dev',
    commit: COMMIT || 'dev',
    buildTime: BUILD_TIME || new Date().toISOString()
  });
});

// 7) Dev-only DLQ debug endpoint
if (process.env.NODE_ENV !== 'production') {
  app.use(dlqDebug);
}

// 8) Error mapper/handler last
app.use(errorHandler);

export default app;
