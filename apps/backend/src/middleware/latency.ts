import type { Request, Response, NextFunction } from 'express';
import { crm_api_latency_ms } from '../metrics/metrics.js';

export function latency() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const diffMs = Number(end - start) / 1_000_000;
      const route = (req.route && req.route.path) || req.path || 'unknown';
      const method = req.method ?? 'UNKNOWN';
      crm_api_latency_ms.labels(method, route, String(res.statusCode)).observe(diffMs);
    });
    next();
  };
}
