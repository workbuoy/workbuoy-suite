import { Router } from 'express';
import { rbac } from '../../src/core/security/rbac';
import { envBool } from '../../src/core/env';
import { loadFeaturesFromRepo, loadRolesFromRepo } from '../../src/roles/loader';
import { getRoleRegistry, importRolesAndFeatures, listOverridesForTenant, setOverride } from '../../src/roles/service';
import type { OrgRoleOverride, UserRoleBinding } from '../../src/roles/types';

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
    const roles = loadRolesFromRepo();
    const features = loadFeaturesFromRepo();
    const summary = await importRolesAndFeatures(roles, features);
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
    rolesResolved: ctx.roles.map(r => ({ role_id: r.role_id, title: r.canonical_title })),
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
    const override = overrides.find(o => o.role_id === roleId) ?? null;
    res.json({ tenantId, roleId, override, effective: summary });
  } catch (err: any) {
    res.status(500).json({ error: 'role_inspect_failed', message: err?.message || String(err) });
  }
});

export default router;
