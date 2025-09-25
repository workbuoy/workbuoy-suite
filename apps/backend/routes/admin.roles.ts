import { Router } from 'express';
import { rbac } from '../../../src/core/security/rbac.js';
import { envBool } from '../../../src/core/env.js';
import { loadRoleCatalog } from '../../../src/roles/loader.js';
import { getRoleRegistry, importRolesAndFeatures, listOverridesForTenant, setOverride } from '../../../src/roles/service.js';
import type { OrgRoleOverride, UserRoleBinding } from '../../../src/roles/types.js';

const router = Router();
const requireAdmin = rbac(['admin']);

function tenantFrom(req: any): string {
  return String(req.header('x-tenant') || req.header('x-tenant-id') || req.body?.tenantId || 'demo');
}

function ensurePersistence(res: any): boolean {
  if (!envBool('FF_PERSISTENCE', false)) {
    res.status(412).json({ error: 'persistence_disabled', message: 'FF_PERSISTENCE must be true for admin role operations' });
    return false;
  }
  return true;
}

router.post('/admin/roles/import', requireAdmin, async (_req, res) => {
  if (!ensurePersistence(res)) return;
  try {
    const catalog = loadRoleCatalog();
    const summary = await importRolesAndFeatures(catalog.roles, catalog.features);
    res.json({ ok: true, imported: summary });
  } catch (err: any) {
    res.status(500).json({ error: 'roles_import_failed', message: err?.message || String(err) });
  }
});

async function summarizeRole(tenantId: string, roleId: string) {
  const registry = await getRoleRegistry({ refresh: true });
  const binding: UserRoleBinding = { userId: '__admin__', primaryRole: roleId };
  const ctx = registry.getUserContext(tenantId, binding);
  if (!ctx.roles.length) {
    return null;
  }
  return {
    rolesResolved: ctx.roles.map((role: any) => ({ role_id: role.role_id, title: role.canonical_title })),
    featureCaps: ctx.featureCaps,
    features: ctx.features,
  };
}

router.put('/admin/roles/:roleId/overrides', requireAdmin, async (req, res) => {
  if (!ensurePersistence(res)) return;
  const tenantId = tenantFrom(req);
  const roleId = String(req.params.roleId);
  const { featureCaps, disabledFeatures } = req.body || {};
  try {
    const normalizedCaps = featureCaps
      ? Object.fromEntries(
          Object.entries(featureCaps)
            .map(([fid, cap]: [string, any]) => [fid, Number(cap)])
            .filter(([, cap]) => !Number.isNaN(cap))
        )
      : undefined;
    const override = await setOverride(tenantId, roleId, {
      tenantId,
      role_id: roleId as OrgRoleOverride['role_id'],
      featureCaps: normalizedCaps,
      disabledFeatures: Array.isArray(disabledFeatures) ? disabledFeatures.map((v: any) => String(v)) : undefined,
    });
    const summary = await summarizeRole(tenantId, roleId);
    if (!summary) {
      return res.status(404).json({ error: 'role_not_found', message: `role ${roleId} not registered` });
    }
    res.json({ tenantId, roleId, override, effective: summary });
  } catch (err: any) {
    res.status(500).json({ error: 'override_failed', message: err?.message || String(err) });
  }
});

router.get('/admin/roles/:roleId', requireAdmin, async (req, res) => {
  if (!ensurePersistence(res)) return;
  const tenantId = tenantFrom(req);
  const roleId = String(req.params.roleId);
  try {
    const summary = await summarizeRole(tenantId, roleId);
    if (!summary) {
      return res.status(404).json({ error: 'role_not_found', message: `role ${roleId} not registered` });
    }
    const overrides = await listOverridesForTenant(tenantId);
    const override = overrides.find((o: any) => o.role_id === roleId) ?? null;
    res.json({ tenantId, roleId, override, effective: summary });
  } catch (err: any) {
    res.status(500).json({ error: 'role_inspect_failed', message: err?.message || String(err) });
  }
});

export default router;
