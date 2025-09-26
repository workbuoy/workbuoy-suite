import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAudit, getCounters, getStore } from './config.js';

export const RbacRouter = Router();

RbacRouter.get('/bindings', async (req: Request, res: Response) => {
  const tenant = String(req.header('x-tenant-id') ?? 'demo-tenant');
  const items = await getStore().listBindings(tenant);
  res.json({ items });
});

RbacRouter.post('/bindings', async (req: Request, res: Response) => {
  const tenant = String(req.header('x-tenant-id') ?? 'demo-tenant');
  const payload = { ...req.body, tenant_id: tenant };
  const binding = await getStore().upsert(payload);
  getCounters().policyChange.inc();
  const audit = getAudit();
  if (audit) {
    await audit({
      type: 'rbac.policy.change',
      tenant_id: tenant,
      actor_id: ((req as any).actor_user_id ?? null) as string | null,
      details: { op: 'upsert', binding },
    });
  }
  res.status(201).json(binding);
});

RbacRouter.delete('/bindings/:id', async (req: Request, res: Response) => {
  const tenant = String(req.header('x-tenant-id') ?? 'demo-tenant');
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: 'binding-id-required' });
  }
  const ok = await getStore().delete(id, tenant);
  if (!ok) {
    return res.status(404).json({ error: 'Not found' });
  }
  getCounters().policyChange.inc();
  const audit = getAudit();
  if (audit) {
    await audit({
      type: 'rbac.policy.change',
      tenant_id: tenant,
      actor_id: ((req as any).actor_user_id ?? null) as string | null,
      details: { op: 'delete', id },
    });
  }
  return res.status(204).end();
});
