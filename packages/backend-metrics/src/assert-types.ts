import { createMetricsRouter } from './index.js';
import type { ExpressLikeApp, MetricsRouterOptions } from './types.js';

const _routerOnly = createMetricsRouter({ path: '/metrics' } satisfies MetricsRouterOptions);
const _withApp = createMetricsRouter(
  { get() {} } satisfies ExpressLikeApp,
  { path: '/metrics' } satisfies MetricsRouterOptions
);

void (_routerOnly && _withApp);
