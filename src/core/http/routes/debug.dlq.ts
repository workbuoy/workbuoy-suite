import { Router } from 'express';
import bus from '../../events/priorityBus';
const router = Router();
router.get('/api/_debug/dlq', (_req, res) => {
  res.json({ ok:true, ...bus._peek() });
});
export default router;
