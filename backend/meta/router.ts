import { Router, Request, Response } from 'express';
import { getHealth } from './health';
import { getVersion } from './version';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  try {
    const payload = getHealth();
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(200).json({ status: 'down', uptime_s: 0, git_sha: 'unknown', started_at: new Date().toISOString() });
  }
});

router.get('/readiness', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/version', (_req: Request, res: Response) => {
  const payload = getVersion();
  return res.status(200).json(payload);
});

router.get('/capabilities', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
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

export default router;
