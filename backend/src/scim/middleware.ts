import { Request, Response, NextFunction } from 'express';

const TOKEN = process.env.SCIM_BEARER_TOKEN || 'scim-dev-token';
export function scimAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.header('Authorization') || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'missing bearer' });
  const tok = h.substring(7).trim();
  if (tok !== TOKEN) return res.status(401).json({ error: 'invalid token' });
  next();
}
