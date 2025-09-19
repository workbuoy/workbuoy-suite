import { Router } from 'express';
import { getRecentProactivityEvents } from '../../src/core/proactivity/telemetry';

const router: any = Router();

router.get('/explain/last', (_req: any, res: any) => {
  const events = getRecentProactivityEvents(10);
  res.json({ events });
});

export default router;
