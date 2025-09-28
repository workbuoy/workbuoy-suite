import express from 'express';
import type { Router } from 'express';
import app from './app.secure.js';
import { createAuthModule } from '@workbuoy/backend-auth';
import { swaggerRouter as buildSwaggerRouter } from './docs/swagger.js';
import { configureRbac, RbacRouter } from '@workbuoy/backend-rbac';
import { audit } from './audit/audit.js';
import { healthHandler } from './http/health.js';
import { readyHandler } from './http/ready.js';
import { versionHandler } from './http/version.js';

import { correlationHeader } from '../../../src/middleware/correlationHeader.js';
import { wbContext } from '../../../src/middleware/wbContext.js';
import { requestLogger } from '../../../src/core/logging/logger.js';
import {
  timingMiddleware,
  metricsHandler,
  createEventBusMetricsCollector,
} from '../../../src/core/observability/metrics.js';
import { withMetrics } from '@workbuoy/backend-metrics';
import { createMetricsRouter } from './metrics/router.js';
import { getRegistry } from './metrics/registry.js';
import { initializeMetricsBridge } from './metrics/bridge.js';
import { isMetricsEnabled } from './observability/metricsConfig.js';

function normalizeMetricsRoute(value?: string | null): string {
  if (!value) {
    return '/metrics';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '/metrics';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
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

const metricsRoute = normalizeMetricsRoute(process.env.METRICS_ROUTE);

if (isMetricsEnabled()) {
  const registry = getRegistry();
  const collectEventBusMetrics = createEventBusMetricsCollector(registry);
  initializeMetricsBridge();
  withMetrics(app, { registry, enableDefaultMetrics: false });
  app.use(metricsRoute, createMetricsRouter({ beforeCollect: collectEventBusMetrics }));
} else {
  app.use(timingMiddleware);
  app.get(metricsRoute, metricsHandler);
}

app.use(requestLogger());

app.set('eventBus', bus);

const noopCounter = { inc: () => {} } as const;

configureRbac({
  audit,
  counters: {
    denied: noopCounter,
    policyChange: noopCounter,
  },
});

const { router: authRouter } = createAuthModule({ audit });

app.use('/', authRouter);
app.use('/', buildSwaggerRouter());

const api = express.Router();
api.get('/health', healthHandler);
api.get('/ready', readyHandler);
api.get('/version', versionHandler);

app.use('/api', api);

app.use('/api/crm', crmRouter());
app.use('/api/tasks', tasksRouter());
app.use('/api/logs', logRouter());
app.use('/api', dealsRouter as unknown as Router);
app.use('/buoy', buoyRouter());
app.use('/api/insights', insightsRouter());
app.use('/api/finance', financeReminderRouter());
app.use('/api', manualCompleteRouter());
app.use('/', metaGenesisRouter());

void (async () => {
  const optionalRoutes: Array<{
    label: string;
    path: string;
    mount: (router: any) => void;
  }> = [
    { label: '/usage', path: '../routes/usage.js', mount: (router) => app.use('/api', router) },
    { label: '/features', path: '../routes/features.js', mount: (router) => app.use('/api', router) },
    { label: '/proactivity', path: '../routes/proactivity.js', mount: (router) => app.use('/api', router) },
    {
      label: '/admin/subscription',
      path: '../routes/admin.subscription.js',
      mount: (router) => app.use('/api', router),
    },
    {
      label: '/admin/roles',
      path: '../routes/admin.roles.js',
      mount: (router) => app.use('/api', router),
    },
    {
      label: '/explainability',
      path: '../routes/explainability.js',
      mount: (router) => app.use('/api', router),
    },
    {
      label: '/connectors health',
      path: '../routes/connectors.health.js',
      mount: (router) => app.use('/api', router),
    },
    {
      label: '/proposals',
      path: '../routes/proposals.js',
      mount: (router) => app.use('/api', router),
    },
  ];

  for (const route of optionalRoutes) {
    try {
      // @ts-ignore -- optional routes are excluded from PR4 typecheck/container builds
      const mod = await import(route.path);
      const router = (mod as any)?.default ?? mod;
      if (router) {
        route.mount(router);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[routes] ${route.label} skipped:`, message);
    }
  }
})();

app.use('/api', knowledgeRouter as unknown as Router);
app.use('/api/audit', auditRouter());
app.use('/api/rbac', RbacRouter);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api', debugDlqRouter());
  app.use('/api', debugCircuitRouter());
  void (async () => {
    try {
      // @ts-ignore -- optional routes are excluded from PR4 typecheck/container builds
      const mod = await import('../routes/dev.runner.js');
      const router = (mod as any)?.default ?? mod;
      if (router) {
        app.use('/api', router);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[routes] /dev runner skipped:', message);
    }
  })();
}

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
