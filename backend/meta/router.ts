import { Router, Request, Response } from 'express';
import { getHealth } from './health';
import { getVersion } from './version';
import { runReadiness } from './readiness';
import type { Probe } from './probes';
import { getCapabilities } from './capabilities';

export interface ReadinessOptions {
  probes?: Probe[];
  runner?: typeof runReadiness;
}

export interface MetaRouterOptions {
  readiness?: ReadinessOptions;
}

const defaultReadiness: Required<ReadinessOptions> = {
  probes: [],
  runner: runReadiness,
};

export function createMetaRouter(options: MetaRouterOptions = {}): Router {
  const router = Router();
  const readinessConfig = { ...defaultReadiness, ...(options.readiness ?? {}) };

  router.get('/health', (_req: Request, res: Response) => {
    try {
      const payload = getHealth();
      return res.status(200).json(payload);
    } catch (err) {
      return res
        .status(200)
        .json({ status: 'down', uptime_s: 0, git_sha: 'unknown', started_at: new Date().toISOString() });
    }
  });

  router.get('/readiness', async (req: Request, res: Response) => {
    try {
      const include = req.query.include;
      const result = await readinessConfig.runner(
        readinessConfig.probes,
        include as string | string[] | undefined,
      );
      return res.status(200).json(result);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'readiness_failed';
      return res.status(200).json({ status: 'not_ready', checks: [], reason });
    }
  });

  router.get('/version', (_req: Request, res: Response) => {
    const payload = getVersion();
    return res.status(200).json(payload);
  });

  router.get('/capabilities', (_req: Request, res: Response) => {
    const payload = getCapabilities();
    res.status(200).json(payload);
  });

  router.get('/policy', (_req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented' });
  });

  router.get('/audit-stats', (_req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented' });
  });

  router.get('/metrics', (_req: Request, res: Response) => {
    res.status(501).send('');
  });

  return router;
}

export default createMetaRouter();
