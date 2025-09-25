import express from 'express';
import app from './app.secure.js';
import { swaggerRouter as buildSwaggerRouter } from './docs/swagger.js';
import { rbacRouter } from './rbac/routes.js';

import { correlationHeader } from '../../../src/middleware/correlationHeader.js';
import { wbContext } from '../../../src/middleware/wbContext.js';
import { requestLogger } from '../../../src/core/logging/logger.js';
import { timingMiddleware, metricsHandler } from '../../../src/core/observability/metrics.js';
import { errorHandler } from '../../../src/core/http/middleware/errorHandler.js';
import { debugBusHandler } from '../../../src/routes/_debug.bus.js';
import knowledgeRouter from '../../../src/routes/knowledge.router.js';
import { auditRouter } from '../../../src/routes/audit.js';
import { bus } from '../../../src/core/eventBusV2.js';
import { crmRouter } from '../../../src/features/crm/routes.js';
import { tasksRouter } from '../../../src/features/tasks/routes.js';
import { logRouter } from '../../../src/features/log/routes.js';
import dealsRouter from '../../../src/features/deals/deals.router.js';
import { buoyRouter } from '../../../src/routes/buoy.complete.js';
import { insightsRouter } from '../../../src/routes/insights.js';
import { financeReminderRouter } from '../../../src/routes/finance.reminder.js';
import { manualCompleteRouter } from '../../../src/routes/manual.complete.js';
import { metaGenesisRouter } from '../../../src/routes/genesis.autonomy.js';
import { debugDlqRouter } from '../../../src/routes/debug.dlq.js';
import { debugCircuitRouter } from '../../../src/routes/debug.circuit.js';

import usageRouter from '../routes/usage.js';
import featuresRouter from '../routes/features.js';
import proactivityRouter from '../routes/proactivity.js';
import adminSubscriptionRouter from '../routes/admin.subscription.js';
import adminRolesRouter from '../routes/admin.roles.js';
import explainabilityRouter from '../routes/explainability.js';
import proposalsRouter from '../routes/proposals.js';
import connectorsHealthRouter from '../routes/connectors.health.js';
import devRunnerRouter from '../routes/dev.runner.js';

// core body parsing for JSON payloads and raw capture for connector webhooks
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      if (buf?.length) {
        req.rawBody = Buffer.from(buf);
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use(correlationHeader);
app.use(wbContext);
app.use(timingMiddleware);
app.use(requestLogger());

app.set('eventBus', bus);

app.use('/', buildSwaggerRouter());

app.use('/api/crm', crmRouter());
app.use('/api/tasks', tasksRouter());
app.use('/api/logs', logRouter());
app.use('/api', dealsRouter);
app.use('/buoy', buoyRouter());
app.use('/api/insights', insightsRouter());
app.use('/api/finance', financeReminderRouter());
app.use('/api', manualCompleteRouter());
app.use('/', metaGenesisRouter());

app.use('/api', usageRouter);
app.use('/api', featuresRouter);
app.use('/api', proactivityRouter);
app.use('/api', adminSubscriptionRouter);
app.use('/api', adminRolesRouter);
app.use('/api', explainabilityRouter);
app.use('/api', proposalsRouter);
app.use('/api', connectorsHealthRouter);

app.use('/api', knowledgeRouter);
app.use('/api/audit', auditRouter());
app.use('/api/rbac', rbacRouter);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api', debugDlqRouter());
  app.use('/api', debugCircuitRouter());
  app.use('/api', devRunnerRouter);
}

app.get('/metrics', metricsHandler);

app.get('/status', async (_req, res) => {
  try {
    const stats = await bus.stats();
    const summary = stats.summary ?? { high: 0, medium: 0, low: 0, dlq: 0 };
    res.json({
      ok: true,
      ts: new Date().toISOString(),
      persistMode: (process.env.PERSIST_MODE || 'file').toLowerCase(),
      queues: summary,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'status_unavailable', message: err?.message || String(err) });
  }
});

app.get('/_debug/bus', debugBusHandler);
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/readyz', (_req, res) => res.json({ ok: true }));
app.get('/buildz', (_req, res) =>
  res.json({
    version: process.env.BUILD_VERSION || 'dev',
    commit: process.env.BUILD_COMMIT || 'dev',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  }),
);

app.use(errorHandler);

export default app;
