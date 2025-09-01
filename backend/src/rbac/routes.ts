import { Router } from 'express';
import { store } from './middleware.js';
import { audit } from '../audit/log.js';
import { rbac_policy_change_total } from '../metrics/metrics.js';

export const rbacRouter = Router();

rbacRouter.get('/bindings', async (req, res) => {
  const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
  const out = await store.listBindings(tenant);
  res.json({ items: out });
});

rbacRouter.post('/bindings', async (req, res) => {
  const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
  const body = { ...req.body, tenant_id: tenant };
  const rb = await store.upsert(body);
  rbac_policy_change_total.inc();
  audit({ type: 'rbac.policy.change', tenant_id: tenant, actor_id: (req as any).actor_user_id || null, details: { op: 'upsert', rb } });
  res.status(201).json(rb);
});

rbacRouter.delete('/bindings/:id', async (req, res) => {
  const tenant = String(req.header('x-tenant-id') || 'demo-tenant');
  const ok = await store.delete(req.params.id, tenant);
  if (ok) {
    rbac_policy_change_total.inc();
    audit({ type: 'rbac.policy.change', tenant_id: tenant, actor_id: (req as any).actor_user_id || null, details: { op: 'delete', id: req.params.id } });
    res.status(204).end();
  } else res.status(404).json({ error: 'Not found' });
});
