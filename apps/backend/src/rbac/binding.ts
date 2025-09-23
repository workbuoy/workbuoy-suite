export type Role = 'admin'|'manager'|'contributor'|'viewer';
export interface Binding {
  tenant_id: string;
  group: string;     // external group id/name
  role: Role;
  resource?: { kind: 'pipeline'|'record'|'org'; id?: string };
}

const inMemory: Binding[] = [];

export function upsertBinding(b: Binding) {
  const i = inMemory.findIndex(x => x.tenant_id===b.tenant_id && x.group===b.group && x.role===b.role && x.resource?.id===b.resource?.id);
  if (i>=0) inMemory[i]=b; else inMemory.push(b);
  return b;
}

export function resolveRoles(tenant_id: string, groups: string[]): Role[] {
  const roles = new Set<Role>();
  for (const g of groups) {
    inMemory.filter(b => b.tenant_id===tenant_id && b.group===g).forEach(b => roles.add(b.role));
  }
  if (roles.size===0) roles.add('viewer');
  return Array.from(roles);
}
