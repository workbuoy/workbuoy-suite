import { RoleProfile, OrgRoleOverride, FeatureDef, UserRoleBinding } from './types';

export class RoleRegistry {
  constructor(
    private roles: RoleProfile[],
    private features: FeatureDef[],
    private overrides: OrgRoleOverride[] = []
  ) {}

  getUserContext(tenantId: string, binding: UserRoleBinding) {
    const resolved = this.resolveRoles(binding);
    const effCaps = this.composeFeatureCaps(tenantId, resolved);
    const activeFeatures = this.features
      .filter(f => effCaps[f.id] !== 0)
      .map(f => ({ ...f, autonomyCap: effCaps[f.id] ?? f.defaultAutonomyCap ?? 3 }));
    return { roles: resolved, features: activeFeatures, featureCaps: effCaps, scope: this.composeScope(resolved) };
  }

  private resolveRoles(binding: UserRoleBinding) {
    const byId = new Map(this.roles.map(r => [r.role_id, r]));
    const acc = new Map<string,RoleProfile>();
    const add = (rid?: string) => {
      if (!rid) return;
      const r = byId.get(rid); if (!r) return;
      if (!acc.has(rid)) { acc.set(rid, r); (r.inherits||[]).forEach(add); }
    };
    add(binding.primaryRole);
    (binding.secondaryRoles||[]).forEach(add);
    return Array.from(acc.values());
  }

  private composeFeatureCaps(tenantId: string, rs: RoleProfile[]) {
    const caps: Record<string, number> = {};
    rs.forEach(r => Object.entries(r.featureCaps||{}).forEach(([fid, cap]) => {
      caps[fid] = Math.max(caps[fid]||0, Number(cap));
    }));
    const orgs = this.overrides.filter(o => o.tenantId===tenantId && rs.some(r=>r.role_id===o.role_id));
    for (const org of orgs) {
      Object.entries(org.featureCaps||{}).forEach(([fid, cap]) => { caps[fid] = Number(cap); });
      (org.disabledFeatures||[]).forEach(fid => { caps[fid] = 0; });
    }
    return caps;
  }

  private composeScope(rs: RoleProfile[]) {
    if (rs.some(r=>['sales_manager','sales_director'].includes(r.role_id))) return { crmScope:'team' };
    if (rs.some(r=>r.role_id==='board_member')) return { scope:'org' };
    return { crmScope:'self' };
  }
}
