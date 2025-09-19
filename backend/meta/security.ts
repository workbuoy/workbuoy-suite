import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

export const publicMetaRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

export function requireMetaRead(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: unknown = (req as any).user;
    if (
      user &&
      typeof user === 'object' &&
      Array.isArray((user as any).scopes) &&
      (user as any).scopes.includes('meta:read')
    ) {
      next();
      return;
    }
    res.status(403).json({ error: 'forbidden' });
  };
}
