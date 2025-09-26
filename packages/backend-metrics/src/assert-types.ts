import { createMetricsRouter } from './index.js';
import type { ExpressLikeApp, MetricsRouterOptions } from './types.js';

// Force both overloads to be type-checked and emitted in d.ts
const _a = createMetricsRouter({ path: '/metrics' } satisfies MetricsRouterOptions);
const _b = createMetricsRouter({ get(){} } satisfies ExpressLikeApp, { path: '/metrics' } satisfies MetricsRouterOptions);
void (_a && _b);
