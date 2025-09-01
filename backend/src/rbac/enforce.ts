import { Request, Response, NextFunction } from 'express';

const ENFORCE = (process.env.RBAC_ENFORCE || 'true') === 'true';

export function enforce(required: 'read'|'write'|'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!ENFORCE) return next();
    const role = String(req.header('x-user-role') || 'viewer');
    const table = { 'viewer':1, 'contributor':2, 'manager':3, 'admin':4 } as any;
    const level = table[role] || 0;
    const need = required === 'read' ? 1 : required === 'write' ? 2 : 4;
    if (level < need) return res.status(403).json({ error: 'forbidden' });
    next();
  }
}
