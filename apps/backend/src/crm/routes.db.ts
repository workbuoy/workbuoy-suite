import { Router } from 'express';
import { repo } from './repo.js';
import { requireRole } from '../middleware/rbac.js';

export const crmDbRouter = Router();

crmDbRouter.get('/contacts', async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id };
    const limit = parseInt(String(req.query.limit||'50'),10);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const items = await repo.listContacts(ctx, limit, cursor);
    res.json({ items, next_cursor: items.length ? items[items.length-1].id : null });
  } catch (e) { next(e); }
});

crmDbRouter.post('/contacts', requireRole('contributor'), async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const c = await repo.createContact(ctx, req.body);
    res.status(201).json(c);
  } catch (e) { next(e); }
});

crmDbRouter.patch('/contacts/:id', requireRole('contributor'), async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const c = await repo.updateContact(ctx, req.params.id, req.body);
    res.json(c);
  } catch (e) { next(e); }
});

crmDbRouter.get('/pipelines', async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id };
    const items = await repo.listPipelines(ctx);
    res.json({ items });
  } catch (e) { next(e); }
});

crmDbRouter.post('/pipelines', requireRole('manager'), async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const p = await repo.upsertPipeline(ctx, undefined, req.body);
    res.status(201).json(p);
  } catch (e) { next(e); }
});

crmDbRouter.get('/opportunities', async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id };
    const limit = parseInt(String(req.query.limit||'50'),10);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const items = await repo.listOpportunities(ctx, limit, cursor);
    res.json({ items, next_cursor: items.length ? items[items.length-1].id : null });
  } catch (e) { next(e); }
});

crmDbRouter.post('/opportunities', requireRole('contributor'), async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const o = await repo.createOpportunity(ctx, req.body);
    res.status(201).json(o);
  } catch (e) { next(e); }
});

crmDbRouter.patch('/opportunities/:id', requireRole('contributor'), async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id, roles: (req as any).roles };
    const o = await repo.patchOpportunity(ctx, req.params.id, req.body);
    res.json(o);
  } catch (e) { next(e); }
});
