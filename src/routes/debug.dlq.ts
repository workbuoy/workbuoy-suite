import { Router } from 'express';

// expects app.set('eventBus', { getDLQ: () => any[] })
export function debugDlqRouter() {
  const r = Router();
  r.get('/_debug/dlq', (req: any, res) => {
    const bus = req.app.get('eventBus');
    const items = (bus && typeof bus.getDLQ === 'function') ? bus.getDLQ() : [];
    res.json({ size: Array.isArray(items) ? items.length : 0, items });
  });
  return r;
}
