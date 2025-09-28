import express from 'express';
import { repo } from './repo.js';
import { requireRole } from '@workbuoy/backend-rbac';

export const crmDbRouter = express.Router();

function requireParam(req: any, res: any, name: string): string | null {
  const value = String(req.params?.[name] ?? '').trim();
  if (!value) {
    res.status(400).json({ error: `${name}_required` });
    return null;
  }
  return value;
}

crmDbRouter.get('/contacts', async (req, res, next) => {
  try {
    const ctx = { tenant_id: (req as any).tenant_id || 'demo-tenant', user_id: (req as any).actor_user_id };
    const limit = parseInt(String(req.query.limit||'50'),10);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const items = await repo.listContacts(ctx, limit, cursor);
    const last = items.at(-1) ?? null;
    res.json({ items, next_cursor: last ? last.id : null });
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
    const id = requireParam(req, res, 'id');
    if (!id) return;
    const c = await repo.updateContact(ctx, id, req.body);
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
    const last = items.at(-1) ?? null;
    res.json({ items, next_cursor: last ? last.id : null });
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
    const id = requireParam(req, res, 'id');
    if (!id) return;
    const o = await repo.patchOpportunity(ctx, id, req.body);
    res.json(o);
  } catch (e) { next(e); }
});
