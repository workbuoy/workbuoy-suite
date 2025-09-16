import { Router, Request, Response } from 'express';
const router = Router();
router.get('/health', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});
router.get('/readiness', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});
router.get('/version', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
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
