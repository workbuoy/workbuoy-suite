import { Router } from 'express';

export function debugCircuitRouter() {
  const r = Router();
  r.get('/_debug/circuit', (req: any, res) => {
    const conn = req.app.get('financeConnector');
    const breaker = (conn && (conn.breaker || conn._breaker)) || null;
    const state = breaker && breaker.getState ? breaker.getState() : 'na';
    const failures = breaker && breaker.getFailures ? breaker.getFailures() : 0;
    res.json({ state, failures });
  });
  return r;
}
