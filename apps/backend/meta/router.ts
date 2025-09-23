import { Router, type Request, type Response } from 'express';

import { recordMetaRequestLatency, collectMetricsText } from '../../../observability/metrics/meta';

import { getAuditStats, type AuditRepo } from './auditStats';
import { getCapabilities } from './capabilities';
import { getHealth } from './health';
import { getPolicySnapshot } from './policy';
import { createProbe } from './probes';
import { runReadiness } from './readiness';
import { publicMetaRateLimit, requireMetaRead } from './security';
import { getVersion } from './version';

import type { Probe } from './probes';

export interface MetaRouterDeps {
  probes?: Probe[];
  auditRepo?: AuditRepo;
}

type ExpressNext = (err?: unknown) => void;
type ExpressHandler = (req: Request, res: Response, next: ExpressNext) => Promise<void> | void;

export function createMetaRouter(deps: MetaRouterDeps = {}) {
  const router = Router();

  const instrument = (route: string, handler: ExpressHandler): ExpressHandler => {
    return async (req: Request, res: Response, next: ExpressNext) => {
      const start = process.hrtime.bigint();
      const method = req.method || 'GET';
      let recorded = false;

      const finalise = (status: number) => {
        if (recorded) {
          return;
        }
        recorded = true;
        const diff = Number(process.hrtime.bigint() - start) / 1_000_000;
        recordMetaRequestLatency(route, method, status, diff);
      };

      const wrappedNext: ExpressNext = (err?: unknown) => {
        finalise(res.statusCode ?? (err ? 500 : 200));
        next(err);
      };

      try {
        await Promise.resolve(handler(req, res, wrappedNext));
        if (!recorded) {
          finalise(res.statusCode ?? 200);
        }
      } catch (error) {
        finalise(res.statusCode ?? 500);
        next(error as Error);
      }
    };
  };

  // Public: /meta/health
  router.get(
    '/health',
    publicMetaRateLimit,
    instrument('health', (_req: Request, res: Response) => {
      try {
        const payload = getHealth();
        res.status(200).json(payload);
      } catch {
        res.status(200).json({
          status: 'down',
          uptime_s: 0,
          git_sha: 'unknown',
          started_at: new Date().toISOString(),
        });
      }
    }),
  );

  // Public: /meta/version
  router.get(
    '/version',
    publicMetaRateLimit,
    instrument('version', (_req: Request, res: Response) => {
      const payload = getVersion();
      res.status(200).json(payload);
    }),
  );

  // Readiness (always 200; status field carries truth)
  router.get(
    '/readiness',
    requireMetaRead(),
    instrument('readiness', async (req: Request, res: Response) => {
      try {
        const includeParam = (
          req.query.include ? ([] as string[]).concat(req.query.include as any) : []
        ) as string[];
        const include = includeParam
          .flatMap((s) => String(s).split(','))
          .map((s) => s.trim())
          .filter(Boolean);

        const defaultProbes: Probe[] = [
          createProbe('db', {
            async check() {
              return { status: 'ok' as const };
            },
          }),
          createProbe('queue', {
            async check() {
              return { status: 'ok' as const };
            },
          }),
          createProbe('outbound', {
            async check() {
              return { status: 'ok' as const };
            },
          }),
        ];
        const probes = deps.probes ?? defaultProbes;
        const result = await runReadiness(probes, include);
        res.status(200).json(result);
      } catch {
        res.status(200).json({
          status: 'not_ready',
          checks: [{ name: 'handler', status: 'fail', latency_ms: 0, reason: 'handler-error' }],
        });
      }
    }),
  );

  // Capabilities
  router.get(
    '/capabilities',
    requireMetaRead(),
    instrument('capabilities', (_req: Request, res: Response) => {
      try {
        const payload = getCapabilities();
        res.status(200).json(payload);
      } catch {
        // do not leak details
        res.status(200).json({
          modes: { core: false, flex: false, secure: false },
          connectors: [],
          feature_flags: {},
        });
      }
    }),
  );

  // Policy snapshot
  router.get(
    '/policy',
    requireMetaRead(),
    instrument('policy', async (_req: Request, res: Response) => {
      try {
        const snapshot = await getPolicySnapshot();
        res.status(200).json(snapshot);
      } catch {
        // Return safe default snapshot (never 500)
        res.status(200).json({
          autonomy_level: 0,
          policy_profile: 'default',
          deny_counters: { last_1h: 0, last_24h: 0 },
        });
      }
    }),
  );

  router.get(
    '/audit-stats',
    requireMetaRead(),
    instrument('audit-stats', async (req: Request, res: Response) => {
      try {
        const toParam = req.query.to ? new Date(String(req.query.to)) : undefined;
        const fromParam = req.query.from ? new Date(String(req.query.from)) : undefined;

        const repo: AuditRepo = deps.auditRepo ?? {
          async listEvents() {
            return [];
          },
        };

        const payload = await getAuditStats(repo, fromParam, toParam);
        res.status(200).json(payload);
      } catch {
        const now = new Date();
        const hourAgo = new Date(now.getTime() - 3600_000);
        res.status(200).json({
          window: { from: hourAgo.toISOString(), to: now.toISOString() },
          totals: { intents: 0, actions: 0, failures: 0 },
          top_errors: [],
        });
      }
    }),
  );

  router.get(
    '/metrics',
    requireMetaRead(),
    instrument('metrics', async (_req: Request, res: Response) => {
      try {
        const text = await collectMetricsText();
        res.status(200);
        res.setHeader('Content-Type', 'text/plain');
        res.send(text);
      } catch {
        res.status(200).json({ location: '/metrics' });
      }
    }),
  );

  return router;
}

// Default export to preserve existing import style
const defaultRouter = createMetaRouter();
export default defaultRouter;
