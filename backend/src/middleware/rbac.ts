import { Request, Response, NextFunction } from 'express';

export function requireRole(min: 'viewer'|'contributor'|'manager'|'admin') {
  const order = ['viewer','contributor','manager','admin'];
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = (req as any).roles as string[] || ['viewer'];
    const ok = roles.some(r => order.indexOf(r) >= order.indexOf(min));
    if (!ok) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
