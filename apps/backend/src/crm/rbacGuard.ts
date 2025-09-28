import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';

export async function rbacGuard(req: Request, res: Response, next: NextFunction) {
  const tenantId = (req as any).tenant_id;
  const userId = (req as any).actor_user_id;
  if (!tenantId || !userId) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
  const binding = await prisma.userRole.findUnique({ where: { user_id: userId } });
  if (!binding || binding.tenant_id !== tenantId) {
    return res.status(403).json({ error: 'no role' });
  }
  (req as any).role = binding.primaryRole;
  (req as any).roles = [binding.primaryRole, ...(binding.secondaryRoles ?? [])];
  next();
}
