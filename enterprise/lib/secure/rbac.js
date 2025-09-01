/**
 * Enterprise RBAC wrapper — supports scoped permissions and enforcement.
 * Example roles: admin, analyst, agent, auditor
 */
export const SECURE_ROLES = {
  admin:    ['*'],
  analyst:  ['read:*','meta:analyze','kits:read','secure:export'],
  agent:    ['chat:send','kits:purchase','kits:read'],
  auditor:  ['audit:read','secure:export']
};

export function can(role, permission){
  const rules = SECURE_ROLES[role] || [];
  if(rules.includes('*')) return true;
  if(rules.includes(permission)) return true;
  const [ns] = permission.split(':');
  return rules.includes(`read:*`) && permission.startsWith('read:');
}

export function enforce(role, permission){
  if(!can(role, permission)){
    const err = new Error('Denied by RBAC');
    err.status = 403;
    throw err;
  }
  return true;
}

/** Multi-tenant RBAC enforcement */
export function enforceTenant(user, tenantId){
  if(!user || !tenantId) { const e=new Error('tenant_required'); e.status=400; throw e; }
  if(String(user.tenant_id)!==String(tenantId) && !(user.roles||[]).includes('admin')){
    const e=new Error('cross_tenant_access_denied'); e.status=403; throw e;
  }
  return true;
}
