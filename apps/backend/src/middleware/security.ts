import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header('x-api-key');
  const expected = process.env.API_KEY_DEV || 'dev-123';
  if (!key || key !== expected) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).tenant_id = req.header('x-tenant-id') || 'demo-tenant';
  (req as any).actor_user_id = req.header('x-user-id') || 'demo-user';
  (req as any).roles = (req.header('x-roles') || 'admin').split(','); // "admin,manager"
  next();
}

export function attachTraceId(req: Request, _res: Response, next: NextFunction) {
  (req as any).trace_id = req.header('x-trace-id') || randomUUID();
  next();
}

export function rateLimitHeadersStub(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-RateLimit-Limit', '120');
  res.setHeader('X-RateLimit-Remaining', '119');
  res.setHeader('X-RateLimit-Reset', String(Math.floor(Date.now()/1000)+60));
  next();
}

export function requireAdminManager(req: Request, res: Response, next: NextFunction) {
  const roles = (req as any).roles as string[] || [];
  if (roles.includes('admin') || roles.includes('manager')) return next();
  return res.status(403).json({ error: 'Forbidden' });
}
