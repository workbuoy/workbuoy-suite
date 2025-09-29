import express, { Router } from 'express';
import { createAuthModule } from '@workbuoy/backend-auth';
import { configureRbac, RbacRouter } from '@workbuoy/backend-rbac';
import { audit } from './audit/audit.js';
import { withMetrics } from '@workbuoy/backend-metrics';

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
type MiddlewareFn = (...args: any[]) => any;

const SKIP_OPTIONAL = process.env.WB_SKIP_OPTIONAL_ROUTES === '1';
const OPTIONAL_ROUTES_SKIP_MESSAGE =
  '[boot] Skipping optional routes (WB_SKIP_OPTIONAL_ROUTES=1)';
let optionalRoutesWarned = false;

function warnSkippingOptionalRoutes() {
  if (!optionalRoutesWarned) {
    console.warn(OPTIONAL_ROUTES_SKIP_MESSAGE);
    optionalRoutesWarned = true;
  }
}

function resolveModulePath(spec: string): string {
  if (SKIP_OPTIONAL && spec.endsWith('.js')) {
    return spec.slice(0, -3) + '.ts';
  }
  return spec;
}

function pickRequiredExport<T>(
  mod: Record<string, unknown>,
  exportName: string,
  { fallbackToDefault = true }: { fallbackToDefault?: boolean } = {},
): T {
  if (exportName in mod) {
    return mod[exportName] as T;
  }
  if (fallbackToDefault && typeof mod.default !== 'undefined') {
    return mod.default as T;
  }
  throw new Error(`Missing export ${exportName}`);
}

function pickRouterExport(mod: unknown, exportName?: string): unknown {
  if (exportName && mod && typeof mod === 'object' && exportName in mod) {
    return (mod as Record<string, unknown>)[exportName];
  }
  if (typeof mod === 'function') {
    return mod;
  }
  if (mod && typeof mod === 'object') {
    const record = mod as Record<string, unknown>;
    if (typeof record.default !== 'undefined') {
      return record.default;
    }
    if (typeof record.router !== 'undefined') {
      return record.router;
    }
    for (const key of Object.keys(record)) {
      if (/router$/i.test(key) && typeof record[key] !== 'undefined') {
        return record[key];
      }
    }
  }
  return undefined;
}

function resolveRouter(candidate: unknown): Router | undefined {
  if (!candidate) {
    return undefined;
  }
  if (typeof candidate === 'function') {
    if (candidate.length >= 2) {
      return candidate as Router;
    }
    try {
      const produced = (candidate as () => unknown)();
      return resolveRouter(produced);
    } catch (err) {
      console.warn(
        `[routes] Optional router factory threw during init: ${(err as Error)?.message}`,
      );
      return undefined;
    }
  }
  if (candidate && typeof candidate === 'object') {
    return resolveRouter(pickRouterExport(candidate));
  }
  return undefined;
}

async function mountOptionalRouter(
  app: import('express').Express,
  base: string,
  spec: string,
  exportName?: string,
) {
  if (SKIP_OPTIONAL) {
    warnSkippingOptionalRoutes();
    return;
  }
  try {
    const mod = await import(resolveModulePath(spec));
    const candidate = pickRouterExport(mod, exportName);
    const router = resolveRouter(candidate);
    if (router) {
      app.use(base, router);
      console.log(`[routes] Mounted ${spec} at ${base}`);
    } else {
      console.warn(`[routes] Skipping ${spec}: no router export found`);
    }
  } catch (err) {
    console.warn(
      `[routes] Skipping ${spec} due to import error: ${(err as Error)?.message}`,
    );
  }
}

type PriorityBusStats = {
  summary: { high: number; medium: number; low: number; dlq: number };
  queues: Array<{ name: string; size: number; events?: unknown[] }>;
  dlq: unknown[];
};

type PriorityBus = {
  emit: (type: string, payload: unknown, opts?: Record<string, unknown>) => Promise<void>;
  on: (type: string, handler: (payload: unknown) => Promise<void> | void) => void;
  stats: () => Promise<PriorityBusStats>;
};

function createStubBus(): PriorityBus {
  return {
    async emit() {
      /* noop */
    },
    on() {
      /* noop */
    },
    async stats() {
      return {
        summary: { high: 0, medium: 0, low: 0, dlq: 0 },
        queues: [],
        dlq: [],
      };
    },
  };
}

async function loadEventBus(): Promise<PriorityBus> {
  try {
    const mod = await import(resolveModulePath('../../../src/core/eventBusV2.js'));
    const instance =
      (mod as { bus?: PriorityBus }).bus ?? (mod as { default?: PriorityBus }).default;
    if (instance) {
      return instance;
    }
    throw new Error('missing bus export');
  } catch (err) {
    if (!SKIP_OPTIONAL) {
      throw err;
    }
    warnSkippingOptionalRoutes();
    console.warn(
      `[boot] Using stub event bus due to load failure: ${(err as Error)?.message}`,
    );
    return createStubBus();
  }
}

const appModule = await import(resolveModulePath('./app.secure.js'));
const app = pickRequiredExport<import('express').Express>(
  appModule as Record<string, unknown>,
  'default',
);

const swaggerModule = await import(resolveModulePath('./docs/swagger.js'));
const buildSwaggerRouter = pickRequiredExport<(...args: unknown[]) => Router>(
  swaggerModule as Record<string, unknown>,
  'swaggerRouter',
);

const correlationModule = await import(
  resolveModulePath('../../../src/middleware/correlationHeader.js'),
);
const correlationHeader = pickRequiredExport<MiddlewareFn>(
  correlationModule as Record<string, unknown>,
  'correlationHeader',
);

const wbContextModule = await import(resolveModulePath('../../../src/middleware/wbContext.js'));
const wbContext = pickRequiredExport<MiddlewareFn>(
  wbContextModule as Record<string, unknown>,
  'wbContext',
);

const loggerModule = await import(resolveModulePath('../../../src/core/logging/logger.js'));
const requestLogger = pickRequiredExport<() => MiddlewareFn>(
  loggerModule as Record<string, unknown>,
  'requestLogger',
);

const metricsModule = await import(
  resolveModulePath('../../../src/core/observability/metrics.js'),
);
const timingMiddleware = pickRequiredExport<MiddlewareFn>(
  metricsModule as Record<string, unknown>,
  'timingMiddleware',
);
const metricsHandler = pickRequiredExport<MiddlewareFn>(
  metricsModule as Record<string, unknown>,
  'metricsHandler',
);
const createEventBusMetricsCollector = pickRequiredExport<
  (registry: unknown) => () => Promise<void>
>(metricsModule as Record<string, unknown>, 'createEventBusMetricsCollector');

const metricsRouterModule = await import(resolveModulePath('./metrics/router.js'));
const createMetricsRouter = pickRequiredExport<
  (options?: Record<string, unknown>) => Router
>(metricsRouterModule as Record<string, unknown>, 'createMetricsRouter');

const metricsRegistryModule = await import(resolveModulePath('./metrics/registry.js'));
const getRegistry = pickRequiredExport<() => any>(
  metricsRegistryModule as Record<string, unknown>,
  'getRegistry',
);

const metricsBridgeModule = await import(resolveModulePath('./metrics/bridge.js'));
const initializeMetricsBridge = pickRequiredExport<() => void>(
  metricsBridgeModule as Record<string, unknown>,
  'initializeMetricsBridge',
);

const metricsConfigModule = await import(
  resolveModulePath('./observability/metricsConfig.js'),
);
const isMetricsEnabled = pickRequiredExport<() => boolean>(
  metricsConfigModule as Record<string, unknown>,
  'isMetricsEnabled',
);

const errorHandlerModule = await import(
  resolveModulePath('../../../src/core/http/middleware/errorHandler.js'),
);
const errorHandler = pickRequiredExport<MiddlewareFn>(
  errorHandlerModule as Record<string, unknown>,
  'errorHandler',
);

const debugBusModule = await import(resolveModulePath('../../../src/routes/_debug.bus.js'));
const debugBusHandler = pickRequiredExport<MiddlewareFn>(
  debugBusModule as Record<string, unknown>,
  'debugBusHandler',
);

const debugDlqModule = await import(resolveModulePath('../../../src/routes/debug.dlq.js'));
const debugDlqRouter = pickRequiredExport<() => Router>(
  debugDlqModule as Record<string, unknown>,
  'debugDlqRouter',
);

const versionModule = await import(resolveModulePath('./http/version.js'));
const versionHandler = pickRequiredExport<MiddlewareFn>(
  versionModule as Record<string, unknown>,
  'versionHandler',
);

const debugCircuitModule = await import(resolveModulePath('../../../src/routes/debug.circuit.js'));
const debugCircuitRouter = pickRequiredExport<() => Router>(
  debugCircuitModule as Record<string, unknown>,
  'debugCircuitRouter',
);

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
    const mod = await import(resolveModulePath(spec));
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

const eventBus = await loadEventBus();
app.set('eventBus', eventBus);

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

await mountOptionalRouter(app, '/api/crm', '../../../src/features/crm/routes.js', 'crmRouter');
await mountOptionalRouter(app, '/api/tasks', '../../../src/features/tasks/routes.js', 'tasksRouter');
await mountOptionalRouter(app, '/api/logs', '../../../src/features/log/routes.js', 'logRouter');
await mountOptionalRouter(app, '/api', '../../../src/features/deals/deals.router.js');
await mountOptionalRouter(app, '/buoy', '../../../src/routes/buoy.complete.js', 'buoyRouter');
await mountOptionalRouter(app, '/api/insights', '../../../src/routes/insights.js', 'insightsRouter');
await mountOptionalRouter(
  app,
  '/api/finance',
  '../../../src/routes/finance.reminder.js',
  'financeReminderRouter',
);
await mountOptionalRouter(app, '/api', '../../../src/routes/manual.complete.js', 'manualCompleteRouter');
await mountOptionalRouter(app, '/', '../../../src/routes/genesis.autonomy.js', 'metaGenesisRouter');

if (!SKIP_OPTIONAL) {
  await mountOptionalRoute(app, '/api', '../routes/usage.js');
  await mountOptionalRoute(app, '/api', '../routes/features.js');
  await mountOptionalRoute(app, '/api', '../routes/proactivity.js');
  await mountOptionalRoute(app, '/api', '../routes/admin.subscription.js');
  await mountOptionalRoute(app, '/api', '../routes/admin.roles.js');
  await mountOptionalRoute(app, '/api', '../routes/explainability.js');
  await mountOptionalRoute(app, '/api', '../routes/proposals.js');
  await mountOptionalRoute(app, '/api', '../routes/connectors.health.js');
} else {
  warnSkippingOptionalRoutes();
}

await mountOptionalRouter(app, '/api', '../../../src/routes/knowledge.router.js');
await mountOptionalRouter(app, '/api/audit', '../../../src/routes/audit.js', 'auditRouter');

app.use('/api/rbac', RbacRouter);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api', debugDlqRouter());
  app.use('/api', debugCircuitRouter());
  if (!SKIP_OPTIONAL) {
    await mountOptionalRoute(app, '/api', '../routes/dev.runner.js');
  } else {
    warnSkippingOptionalRoutes();
  }
}

app.get('/status', async (_req, res) => {
  try {
    const stats = await eventBus.stats();
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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: true, ts: new Date().toISOString() });
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
