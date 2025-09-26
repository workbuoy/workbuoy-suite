import { Router } from 'express';
import type { Request } from 'express';
import type { PrismaClient } from '@prisma/client';
import { repo } from './repo.js';
import { requireRole } from '@workbuoy/backend-rbac';
import { requireString } from '../utils/require.js';

function requirePrisma(req: Request): PrismaClient {
  const prisma = req.app.locals?.prisma as PrismaClient | undefined;
  if (!prisma) {
    throw new Error('Prisma client not initialized on app.locals.prisma');
  }
  return prisma;
}

export const crmDbRouter = Router();

crmDbRouter.get('/contacts', async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id };
    const limit = parseInt(String(req.query.limit||'50'),10);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const items = await repo.listContacts(ctx, limit, cursor);
    res.json({ items, next_cursor: items.length ? items[items.length-1].id : null });
  } catch (e) { next(e); }
});

crmDbRouter.post('/contacts', requireRole('contributor'), async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const c = await repo.createContact(ctx, req.body);
    res.status(201).json(c);
  } catch (e) { next(e); }
});

crmDbRouter.patch('/contacts/:id', requireRole('contributor'), async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const id = requireString(req.params.id, 'req.params.id');
    const c = await repo.updateContact(ctx, id, req.body);
    res.json(c);
  } catch (e) { next(e); }
});

crmDbRouter.get('/pipelines', async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id };
    const items = await repo.listPipelines(ctx);
    res.json({ items });
  } catch (e) { next(e); }
});

crmDbRouter.post('/pipelines', requireRole('manager'), async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const p = await repo.upsertPipeline(ctx, undefined, req.body);
    res.status(201).json(p);
  } catch (e) { next(e); }
});

crmDbRouter.get('/opportunities', async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id };
    const limit = parseInt(String(req.query.limit||'50'),10);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const items = await repo.listOpportunities(ctx, limit, cursor);
    res.json({ items, next_cursor: items.length ? items[items.length-1].id : null });
  } catch (e) { next(e); }
});

crmDbRouter.post('/opportunities', requireRole('contributor'), async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const o = await repo.createOpportunity(ctx, req.body);
    res.status(201).json(o);
  } catch (e) { next(e); }
});

crmDbRouter.patch('/opportunities/:id', requireRole('contributor'), async (req, res, next) => {
  try {
    requirePrisma(req);
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const id = requireString(req.params.id, 'req.params.id');
    const o = await repo.patchOpportunity(ctx, id, req.body);
    res.json(o);
  } catch (e) { next(e); }
});
