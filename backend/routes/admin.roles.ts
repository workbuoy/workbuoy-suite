import { Router } from 'express';
import { importRolesAndFeatures } from '../../src/roles/seed/importer';
import { getRoleRegistry } from '../../src/roles/registryProvider';
import { OverrideRepo } from '../../src/roles/db/OverrideRepo';

const router = Router();
const admin = Router({ mergeParams: true });

function tenantFrom(req: any) {
  return String(req.header('x-tenant') || req.header('x-tenant-id') || req.query?.tenant || 'demo');
}

function requireAdmin(req: any, res: any, next: any) {
  const roles = String(req.header('x-roles') || req.header('x-role') || '').split(',').map((r: string) => r.trim());
  if (!roles.includes('admin')) {
    return res.status(403).json({ error: 'admin_required' });
  }
  return next();
}

admin.post('/roles/import', async (_req, res) => {
  const summary = await importRolesAndFeatures();
  await getRoleRegistry(true);
  res.json({ ok: true, summary });
});

admin.put('/roles/:roleId/overrides', async (req, res) => {
  const tenantId = tenantFrom(req);
  const roleId = String(req.params.roleId);
  const { featureCaps, disabledFeatures } = req.body || {};
  const repo = new OverrideRepo();
  await repo.upsertOverride(tenantId, roleId, {
    tenantId,
    role_id: roleId,
    featureCaps: featureCaps ?? undefined,
    disabledFeatures: Array.isArray(disabledFeatures) ? disabledFeatures : undefined,
  });
  const registry = await getRoleRegistry(true);
  const ctx = registry.getUserContext(tenantId, { userId: `admin:${tenantId}`, primaryRole: roleId });
  res.json({ tenantId, roleId, featureCaps: ctx.featureCaps, features: ctx.features });
});

admin.get('/roles/:roleId', async (req, res) => {
  const tenantId = tenantFrom(req);
  const roleId = String(req.params.roleId);
  const registry = await getRoleRegistry();
  const ctx = registry.getUserContext(tenantId, { userId: `admin:${tenantId}`, primaryRole: roleId });
  if (!ctx.roles.length) {
    return res.status(404).json({ error: 'role_not_found', roleId });
  }
  const repo = new OverrideRepo();
  const overrides = await repo.listOverridesForTenant(tenantId);
  const override = overrides.find(o => o.role_id === roleId) ?? null;
  res.json({ tenantId, roleId, roles: ctx.roles, featureCaps: ctx.featureCaps, override, features: ctx.features });
});

router.use('/admin', requireAdmin, admin);

export default router;
