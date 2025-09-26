/// <reference path="../types/esm-shims.d.ts" />

import { Router, type Request, type Response, type NextFunction } from 'express';
import { requirePrisma, requireUser } from '../require.js';
import { assertDefined } from '../utils/assert.js';

const router = Router();

function requireDealId(req: Request): string {
  const id = (req.params as { dealId?: string }).dealId;
  assertDefined(id, 'dealId required');
  return id as string;
}

function requireCorrelationId(req: Request): string {
  const cid = req.headers['x-correlation-id'] as string | undefined;
  assertDefined(cid, 'x-correlation-id required');
  return cid as string;
}

router.get('/crm/db/deals/:dealId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = requirePrisma(req.app);
    const user = requireUser(req);
    const dealId = requireDealId(req);
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    res.json({ deal, actor: user.id });
  } catch (err) {
    next(err);
  }
});

router.post('/crm/db/deals/:dealId/audit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = requirePrisma(req.app);
    const user = requireUser(req);
    const dealId = requireDealId(req);
    const correlationId = requireCorrelationId(req);

    const payload = req.body;
    assertDefined(payload, 'body required');

    const audit = await prisma.dealAudit.create({
      data: {
        dealId,
        correlationId,
        actorId: user.id,
        payload,
      },
    });

    res.status(201).json({ auditId: audit.id });
  } catch (err) {
    next(err);
  }
});

export default router;
