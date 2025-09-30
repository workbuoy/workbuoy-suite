import express from 'express';
import type { RequestHandler, Router } from 'express';
import { createAuthModule } from '@workbuoy/backend-auth';
import { audit } from './audit/audit.js';
import { mountMetrics } from './metrics/metrics.js';
import { crmProposalRouter } from './routes/crm.proposals.js';

type MiddlewareFn = RequestHandler;

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
  if (spec.startsWith('.') || spec.startsWith('/')) {
    return new URL(spec, import.meta.url).href;
  }
  return spec;
}

async function importModule(spec: string) {
  const resolved = resolveModulePath(spec);
  try {
    return await import(resolved);
  } catch (err) {
    if (resolved.startsWith('file:') && resolved.endsWith('.js')) {
      const tsCandidate = `${resolved.slice(0, -3)}.ts`;
      return import(tsCandidate);
    }
    throw err;
  }
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
    const mod = await importModule(spec);
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
    const mod = await importModule('../../../src/core/eventBusV2.js');
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

const appModule = await importModule('./app.secure.js');
const app = pickRequiredExport<import('express').Express>(
  appModule as Record<string, unknown>,
  'default',
);

const swaggerModule = await importModule('./docs/swagger.js');
const buildSwaggerRouter = pickRequiredExport<(...args: unknown[]) => Router>(
  swaggerModule as Record<string, unknown>,
  'swaggerRouter',
);

const correlationModule = await importModule(
  '../../../src/middleware/correlationHeader.js',
);
const correlationHeader = pickRequiredExport<MiddlewareFn>(
  correlationModule as Record<string, unknown>,
  'correlationHeader',
);

const wbContextModule = await importModule('../../../src/middleware/wbContext.js');
const wbContext = pickRequiredExport<MiddlewareFn>(
  wbContextModule as Record<string, unknown>,
  'wbContext',
);

const loggerModule = await importModule('../../../src/core/logging/logger.js');
const requestLogger = pickRequiredExport<() => MiddlewareFn>(
  loggerModule as Record<string, unknown>,
  'requestLogger',
);

const metricsModule = await importModule(
  '../../../src/core/observability/metrics.js',
);
const timingMiddleware = pickRequiredExport<MiddlewareFn>(
  metricsModule as Record<string, unknown>,
  'timingMiddleware',
);
const metricsBridgeModule = await importModule('./metrics/bridge.js');
const initializeMetricsBridge = pickRequiredExport<() => void>(
  metricsBridgeModule as Record<string, unknown>,
  'initializeMetricsBridge',
);

const metricsConfigModule = await importModule(
  './observability/metricsConfig.js',
);
const isMetricsEnabled = pickRequiredExport<() => boolean>(
  metricsConfigModule as Record<string, unknown>,
  'isMetricsEnabled',
);

const flagsModule = await importModule('./config/flags.js');
const isTelemetryEnabled = pickRequiredExport<() => boolean>(
  flagsModule as Record<string, unknown>,
  'isTelemetryEnabled',
);
const isLoggingEnabled = pickRequiredExport<() => boolean>(
  flagsModule as Record<string, unknown>,
  'isLoggingEnabled',
);

const {
  isTelemetryPersistenceEnabled,
  telemetryRouter,
} = (await import('./telemetry/context.js')) as typeof import('./telemetry/context.js');

if (isTelemetryPersistenceEnabled()) {
  console.log('[telemetry] Feature usage persistence enabled via Prisma storage');
} else {
  console.log('[telemetry] Feature usage persistence disabled; using in-memory store');
}

const errorHandlerModule = await importModule(
  '../../../src/core/http/middleware/errorHandler.js',
);
const errorHandler = pickRequiredExport<MiddlewareFn>(
  errorHandlerModule as Record<string, unknown>,
  'errorHandler',
);

const debugBusModule = await importModule('../../../src/routes/_debug.bus.js');
const debugBusHandler = pickRequiredExport<MiddlewareFn>(
  debugBusModule as Record<string, unknown>,
  'debugBusHandler',
);

const debugDlqModule = await importModule('../../../src/routes/debug.dlq.js');
const debugDlqRouter = pickRequiredExport<() => Router>(
  debugDlqModule as Record<string, unknown>,
  'debugDlqRouter',
);

const versionModule = await importModule('./http/version.js');
const versionHandler = pickRequiredExport<MiddlewareFn>(
  versionModule as Record<string, unknown>,
  'versionHandler',
);

const debugCircuitModule = await importModule('../../../src/routes/debug.circuit.js');
const debugCircuitRouter = pickRequiredExport<() => Router>(
  debugCircuitModule as Record<string, unknown>,
  'debugCircuitRouter',
);

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

type Middleware = (...args: any[]) => any;
const asMw = (m: any): Middleware | undefined =>
  typeof m === 'function'
    ? (m as Middleware)
    : typeof m?.default === 'function'
      ? (m.default as Middleware)
      : typeof m?.router === 'function'
        ? (m.router as Middleware)
        : undefined;

async function mountOptionalRoute(
  app: import('express').Express,
  base: string,
  spec: string,
) {
  try {
    const mod = await importModule(spec);
    const mw = asMw(mod);
    if (!mw) {
      console.warn(
        `[routes] Skipping ${spec}: no callable middleware. typeof=${typeof mod}; keys=${
          mod && typeof mod === 'object' ? Object.keys(mod).join(',') : ''
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

type OptionalPackageMount = (
  app: import('express').Express,
  mod: any,
) => boolean | Middleware | Promise<boolean | Middleware | void> | void;

async function mountOptionalPackage(
  app: import('express').Express,
  spec: string,
  label: string,
  options?: { mount?: OptionalPackageMount },
): Promise<boolean> {
  if (SKIP_OPTIONAL) {
    console.log(`[server] skip optional ${label} (WB_SKIP_OPTIONAL_ROUTES=1)`);
    return false;
  }
  try {
    const mod = await import(spec);
    if (options?.mount) {
      const result = await options.mount(app, mod);
      if (typeof result === 'boolean') {
        if (result) {
          console.log(`[server] mounted optional ${label}`);
        }
        return result;
      }

      const candidate = result ?? mod;
      const mw = asMw(candidate);
      if (!mw) {
        console.warn(
          `[server] optional ${label} export not callable:`,
          candidate && typeof candidate === 'object' ? Object.keys(candidate) : [],
        );
        return false;
      }
      app.use(mw as Middleware);
      console.log(`[server] mounted optional ${label}`);
      return true;
    }

    const mw = asMw(mod);
    if (!mw) {
      console.warn(
        `[server] optional ${label} export not callable:`,
        mod && typeof mod === 'object' ? Object.keys(mod) : [],
      );
      return false;
    }
    app.use(mw as Middleware);
    console.log(`[server] mounted optional ${label}`);
    return true;
  } catch (err) {
    console.warn(`[server] optional ${label} not available:`, (err as Error).message);
    return false;
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

app.use(requestLogger());

const eventBus = await loadEventBus();
app.set('eventBus', eventBus);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: true, ts: new Date().toISOString() });
});

app.get('/api/version', versionHandler);

const crmEnabled = String(process.env.CRM_ENABLED ?? '').toLowerCase() === 'true';
if (crmEnabled) {
  app.use('/api/crm', crmProposalRouter);
  console.log('[routes] CRM proposals enabled (CRM_ENABLED=true)');
}

const noopCounter = { inc: () => {} } as const;

await mountOptionalPackage(app, '@workbuoy/backend-rbac/dist/index.js', 'rbac', {
  mount(expressApp, mod) {
    const configure =
      typeof mod.configureRbac === 'function'
        ? mod.configureRbac
        : typeof mod.default?.configureRbac === 'function'
          ? mod.default.configureRbac
          : undefined;

    if (configure) {
      try {
        configure({
          audit,
          counters: {
            denied: noopCounter,
            policyChange: noopCounter,
          },
        });
      } catch (err) {
        console.warn('[server] optional rbac configure failed:', (err as Error).message);
      }
    }

    const routerCandidate =
      typeof mod.RbacRouter === 'function'
        ? mod.RbacRouter
        : typeof mod.router === 'function'
          ? mod.router
          : typeof mod.default === 'function'
            ? mod.default
            : typeof mod.default?.router === 'function'
              ? mod.default.router
              : undefined;

    const routerMw = asMw(routerCandidate ?? mod);
    if (!routerMw) {
      console.warn(
        '[server] optional rbac export not callable:',
        mod && typeof mod === 'object' ? Object.keys(mod) : [],
      );
      return false;
    }

    expressApp.use('/api/rbac', routerMw as Middleware);
    return true;
  },
});

await mountOptionalPackage(app, '@workbuoy/backend-telemetry/dist/index.js', 'telemetry');

const { router: authRouter } = createAuthModule({ audit });

app.use('/', authRouter);
app.use('/', buildSwaggerRouter());
app.use('/api/telemetry', telemetryRouter);

if (isTelemetryEnabled()) {
  const telemetryRouterModule = await importModule(
    './observability/telemetry/router.js',
  );
  const createTelemetryRouter = pickRequiredExport<() => Router>(
    telemetryRouterModule as Record<string, unknown>,
    'createTelemetryRouter',
  );
  app.use('/observability/telemetry', createTelemetryRouter());
  console.log('[routes] Observability telemetry enabled (TELEMETRY_ENABLED=true)');
}

if (isLoggingEnabled()) {
  const logsRouterModule = await importModule('./observability/logs/router.js');
  const createLogsRouter = pickRequiredExport<() => Router>(
    logsRouterModule as Record<string, unknown>,
    'createLogsRouter',
  );
  app.use('/observability/logs', createLogsRouter());
  console.log('[routes] Observability log ingest enabled (LOGGING_ENABLED=true)');
}

const metricsEnabled = isMetricsEnabled();
if (metricsEnabled) {
  initializeMetricsBridge();
}

const metricsMounted = await mountMetrics(app);
if (!metricsMounted) {
  app.use(timingMiddleware);
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

if (process.env.NODE_ENV !== 'production') {
  app.use('/api', debugDlqRouter());
  app.use('/api', debugCircuitRouter());
  if (!SKIP_OPTIONAL) {
    await mountOptionalRoute(app, '/api', '../routes/dev.runner.js');
  } else {
    warnSkippingOptionalRoutes();
  }
}
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
