import express from 'express';
import { requestContext } from './core/http/middleware/requestContext';
import { errorHandler } from './core/http/middleware/errorHandler';
import { requestLogger } from './core/logging/logger';
import { crmRouter } from './features/crm/routes';
import { tasksRouter } from './features/tasks/routes';
import { logRouter } from './features/log/routes';
import { buoyRouter } from './buoy/routes';
import { metricsRouter } from './core/http/routes/debug.metrics';

const app = express();

// Order: context -> json -> logger -> routes -> health -> error
app.use(requestContext);
app.use(express.json());
app.use(requestLogger());

// Feature routes
app.use('/api/crm', crmRouter());
app.use('/api/tasks', tasksRouter());
app.use('/api/logs', logRouter());
app.use('/buoy', buoyRouter());

// Debug (dev only guard here if you want)
app.use(metricsRouter());

// Health/ready/build
app.get('/healthz', (_req, res)=> res.json({ ok:true }));
app.get('/readyz', (_req, res)=> res.json({ ok:true, bus:true, stores:true }));
app.get('/buildz', (_req, res)=> res.json({
  version: process.env.BUILD_VERSION || 'dev',
  commit: process.env.BUILD_COMMIT || 'local',
  buildTime: process.env.BUILD_TIME || new Date().toISOString()
}));

// Error handler last
app.use(errorHandler);

export default app;
