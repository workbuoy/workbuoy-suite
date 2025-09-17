import { Router, Request, Response } from 'express';

// Existing META helpers
import { runReadiness } from './readiness';
// If your project has these, keep them; otherwise lightweight placeholders:
import { dbProbeFactory } from './probes/dbProbe';
import { queueProbeFactory } from './probes/queueProbe';
import { outboundProbeFactory } from './probes/outboundProbe';

// Health/Version helpers (keep your existing implementations)
import { getHealth } from './health';
import { getVersion } from './version';

// New: capabilities + policy
import { getCapabilities } from './capabilities';
import { getPolicySnapshot, PolicyEngine } from './policy';

import type { Probe } from './probes';

export interface MetaRouterDeps {
  probes?: Probe[];
  dbClient?: any;
  queueClient?: any;
  outbound?: { fetch?: any; url?: string };
  getConfig?: () => { MODE_CORE?: string | boolean; MODE_FLEX?: string | boolean; MODE_SECURE?: string | boolean };
  listConnectors?: () => Array<{ name: string; enabled: boolean }>;
  getEnv?: (k: string) => string | undefined;
  policyEngine?: PolicyEngine;
}

export function createMetaRouter(deps: MetaRouterDeps = {}) {
  const router = Router();

  // Public: /meta/health
  router.get('/health', (_req: Request, res: Response) => {
    try {
      const payload = getHealth();
      return res.status(200).json(payload);
    } catch {
      return res.status(200).json({
        status: 'down',
        uptime_s: 0,
        git_sha: 'unknown',
        started_at: new Date().toISOString(),
      });
    }
  });

  // Public: /meta/version
  router.get('/version', (_req: Request, res: Response) => {
    const payload = getVersion();
    return res.status(200).json(payload);
  });

  // Readiness (always 200; status field carries truth)
  router.get('/readiness', async (req: Request, res: Response) => {
    try {
      const includeParam = (req.query.include ? ([] as string[]).concat(req.query.include as any) : []) as string[];
      const include = includeParam
        .flatMap((s) => String(s).split(','))
        .map((s) => s.trim())
        .filter(Boolean);

      const defaultProbes: Probe[] = [
        dbProbeFactory(deps.dbClient || {}),
        queueProbeFactory(deps.queueClient || {}),
        outboundProbeFactory(deps.outbound || {}),
      ];
      const probes = deps.probes || defaultProbes;
      const result = await runReadiness(probes, include);
      return res.status(200).json(result);
    } catch {
      return res
        .status(200)
        .json({ status: 'not_ready', checks: [{ name: 'handler', status: 'fail', latency_ms: 0, reason: 'handler-error' }] });
    }
  });

  // Capabilities
  router.get('/capabilities', (_req: Request, res: Response) => {
    try {
      const payload = getCapabilities({
        getConfig: deps.getConfig || (() => ({})),
        listConnectors: deps.listConnectors || (() => []),
        getEnv: deps.getEnv || ((k) => process.env[k]),
      });
      return res.status(200).json(payload);
    } catch (err: any) {
      // do not leak details
      return res.status(200).json({
        modes: { core: false, flex: false, secure: false },
        connectors: [],
        feature_flags: {},
      });
    }
  });

  // Policy snapshot
  router.get('/policy', async (_req: Request, res: Response) => {
    try {
      // In production, deps.policyEngine should be Navi-backed; in tests it's mocked.
      const engine: PolicyEngine =
        deps.policyEngine ||
        ({
          async getAutonomyLevel() {
            return 0 as const;
          },
          async getProfile() {
            return 'default' as const;
          },
        } as PolicyEngine);

      const snapshot = await getPolicySnapshot(engine);
      return res.status(200).json(snapshot);
    } catch {
      // Return safe default snapshot (never 500)
      return res.status(200).json({
        autonomy_level: 0,
        policy_profile: 'default',
        deny_counters: { last_1h: 0, last_24h: 0 },
      });
    }
  });

  // Stubs for future META endpoints (left as-is / not implemented here)
  router.get('/audit-stats', (_req: Request, res: Response) => res.status(501).json({ error: 'Not implemented' }));
  router.get('/metrics', (_req: Request, res: Response) => res.status(501).send(''));

  return router;
}

// Default export to preserve existing import style
const defaultRouter = createMetaRouter();
export default defaultRouter;
