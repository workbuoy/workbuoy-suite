import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function rbacGuard(req: Request, res: Response, next: NextFunction) {
  const tenantId = (req as any).tenant_id;
  const userId = (req as any).actor_user_id;
  if (!tenantId || !userId) return res.status(401).json({error:'unauthenticated'});
  const rb = await prisma.roleBinding.findFirst({ where:{ tenantId, userId } });
  if (!rb) return res.status(403).json({error:'no role'});
  (req as any).role = rb.role;
  next();
}
