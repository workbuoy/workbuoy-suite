import express, { Router } from 'express';
import app from './app.secure.js';
import { createAuthModule } from '@workbuoy/backend-auth';
import { swaggerRouter as buildSwaggerRouter } from './docs/swagger.js';
import { configureRbac, RbacRouter } from '@workbuoy/backend-rbac';
import { audit } from './audit/audit.js';

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

import { versionHandler } from './http/version.js';

type MiddlewareFn = (...args: any[]) => any;

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

function asMiddleware(mod: unknown): MiddlewareFn | undefined {
  if (typeof mod === 'function') return mod as MiddlewareFn;
  if (isObject(mod)) {
    const m = mod as Record<string, unknown>;
    if (typeof m.default === 'function') return m.default as MiddlewareFn;
    if (typeof m.router === 'function') return m.router as MiddlewareFn;
  }
  return undefined;
}

async function mountOptionalRoute(
  app: import('express').Express,
  base: string,
  spec: string,
) {
  try {
    const mod = await import(spec);
    const mw = asMiddleware(mod);
    if (!mw) {
      console.warn(
        `[routes] Skipping ${spec}: no callable middleware. typeof=${typeof mod}; keys=${
          isObject(mod) ? Object.keys(mod).join(',') : ''
        }`,
      );
      return;
    }
    app.use(base, mw);
    console.log(`[routes] Mounted ${spec} at ${base}`);
  } catch (err) {
    console.warn(
      `[routes] Skipping ${spec} due to import error: ${(err as Error)?.message}`,
    );
  }
}

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

app.use('/api/crm', crmRouter());
app.use('/api/tasks', tasksRouter());
app.use('/api/logs', logRouter());
app.use('/api', dealsRouter as unknown as Router);
app.use('/buoy', buoyRouter());
app.use('/api/insights', insightsRouter());
app.use('/api/finance', financeReminderRouter());
app.use('/api', manualCompleteRouter());
app.use('/', metaGenesisRouter());

await mountOptionalRoute(app, '/api', './routes/usage.js');
await mountOptionalRoute(app, '/api', './routes/features.js');
await mountOptionalRoute(app, '/api', './routes/proactivity.js');
await mountOptionalRoute(app, '/api', './routes/admin.subscription.js');
await mountOptionalRoute(app, '/api', './routes/admin.roles.js');
await mountOptionalRoute(app, '/api', './routes/explainability.js');
await mountOptionalRoute(app, '/api', './routes/proposals.js');
await mountOptionalRoute(app, '/api', './routes/connectors.health.js');

app.use('/api', knowledgeRouter as unknown as Router);
app.use('/api/audit', auditRouter());
app.use('/api/rbac', RbacRouter);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api', debugDlqRouter());
  app.use('/api', debugCircuitRouter());
  await mountOptionalRoute(app, '/api', './routes/dev.runner.js');
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

app.get('/api/version', versionHandler);
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
