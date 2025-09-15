import type { Request, Response, NextFunction } from 'express';

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  // minimal context; merge with any existing req.wb
  const wb: any = (req as any).wb || {};
  wb.correlationId = wb.correlationId || (globalThis.crypto?.randomUUID?.() || String(Date.now()));
  wb.roleId = (req.headers['x-role-id'] as string) || 'user';
  const al = Number(req.headers['x-autonomy-level'] || 2);
  wb.autonomyLevel = Number.isFinite(al) ? al : 2;
  (req as any).wb = wb;
  next();
}
