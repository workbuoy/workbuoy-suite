import { Router } from 'express';
import { append } from '../../audit/immutableLog';
import bus from '../../events/priorityBus';

const router = Router();

router.post('/complete', (req, res) => {
  const correlationId = req.wb?.correlationId || 'unknown';
  const { intent, params } = req.body || {};
  // Echo result for MVP; later bind planner+actions
  const result = { ok: true, intent, params };
  const explanations = [{ reasoning: 'noop', confidence: 0.8 }];
  bus.emit({ type: 'buoy.action.executed', priority:'low', payload: { intent } });
  append(correlationId, 'buoy.action.executed', { intent, params });
  res.status(200).json({ result, explanations, confidence: 0.8, correlationId });
});

export default router;
