import express from 'express';
import requestContext from './core/http/middleware/requestContext';
import errorHandler from './core/http/middleware/errorHandler';
import crmRoutes from './features/crm/routes';
import tasksRoutes from './features/tasks/routes';
import logRoutes from './features/log/routes';
import buoyRoutes from './core/http/routes/buoy';
import dlqDebug from './core/http/routes/debug.dlq';

const app = express();

// Order
app.use(requestContext);
app.use(express.json());

// Routers
app.use('/api/crm/contacts', crmRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/logs', logRoutes);
app.use('/buoy', buoyRoutes);

// Health/ready/build
app.get('/healthz', (_req, res)=> res.status(200).json({ ok:true }));
app.get('/readyz', (_req, res)=> res.status(200).json({ ok:true, bus:'up' }));
app.get('/buildz', (_req, res)=> {
  const { VERSION, COMMIT, BUILD_TIME } = process.env as any;
  res.json({ version: VERSION||'dev', commit: COMMIT||'dev', buildTime: BUILD_TIME||new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'production'){
  app.use(dlqDebug);
}

app.use(errorHandler);

export default app;
