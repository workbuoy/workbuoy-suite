import { Router } from 'express';
import { getRegistry, getMetricsText, getOpenMetricsText } from './registry.js';

export function createMetricsRouter(path = '/metrics') {
  const r = Router();
  r.get(path, async (req, res) => {
    const accept = String(req.headers['accept'] || '');
    const reg = getRegistry();
    if (accept.includes('openmetrics')) {
      const body = await getOpenMetricsText([reg]);
      res.setHeader('content-type', 'application/openmetrics-text; version=1.0.0; charset=utf-8');
      res.send(body);
      return;
    }
    const body = await getMetricsText([reg]);
    res.setHeader('content-type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(body);
  });
  return r;
}
