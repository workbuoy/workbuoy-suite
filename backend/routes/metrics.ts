import { Router } from 'express';

const router: any = Router();

router.get('/metrics', (_req: any, res: any) => {
  res.type('text/plain; charset=utf-8');
  res.send('proactivity_dummy 1\n');
});

export default router;
