export type Role = 'admin'|'manager'|'contributor'|'viewer'|'deny';
export type ResourceKind = 'pipeline'|'record'|'org';
export type Action = 'read'|'create'|'update'|'delete';

export interface RoleBinding {
  id: string;
  tenant_id: string;
  user_id?: string | null;
  group?: string | null;
  role: Role;
  effect?: 'allow'|'deny'; // deny overrides if present
  resource?: { kind: ResourceKind; id?: string | null };
  created_at: number;
}

export interface Subject {
  tenant_id: string;
  user_id?: string | null;
  groups?: string[];
  roles?: Role[]; // direct roles from SSO token
}

export interface Decision {
  allow: boolean;
  reason: string;
  binding?: RoleBinding | null;
}

export interface Store {
  listBindings(tenant_id: string): Promise<RoleBinding[]>;
  upsert(b: Omit<RoleBinding, 'id'|'created_at'> & { id?: string }): Promise<RoleBinding>;
  delete(id: string, tenant_id: string): Promise<boolean>;
}

export class MemoryStore implements Store {
  private data = new Map<string, RoleBinding[]>();
  async listBindings(tenant_id: string) { return this.data.get(tenant_id) || []; }
  async upsert(b: any) {
    const id = b.id || Math.random().toString(36).slice(2);
    const rb: RoleBinding = { id, created_at: Date.now(), effect: 'allow', ...b };
    const arr = this.data.get(rb.tenant_id) || [];
    const idx = arr.findIndex(x => x.id === rb.id);
    if (idx>=0) arr[idx] = rb; else arr.push(rb);
    this.data.set(rb.tenant_id, arr);
    return rb;
  }
  async delete(id: string, tenant_id: string) {
    const arr = this.data.get(tenant_id) || [];
    const idx = arr.findIndex(x => x.id === id);
    if (idx<0) return false;
    arr.splice(idx,1); this.data.set(tenant_id, arr); return true;
  }
}

function roleOrder(role: Role): number {
  return ['viewer','contributor','manager','admin','deny'].indexOf(role);
}

export async function decide(store: Store, sub: Subject, action: Action, resource: { kind: ResourceKind; id?: string|null; owner_id?: string|null }): Promise<Decision> {
  // Deny overrides: if any binding explicitly deny -> deny
  const bindings = await store.listBindings(sub.tenant_id);
  const subjectGroups = new Set(sub.groups || []);
  const subjectUser = sub.user_id || null;

  const relevant = bindings.filter(b => {
    if (b.tenant_id !== sub.tenant_id) return false;
    if (b.user_id && b.user_id !== subjectUser) return false;
    if (b.group && !subjectGroups.has(b.group)) return false;
    if (!b.resource) return true;
    if (b.resource.kind !== resource.kind) return false;
    if (b.resource.id && resource.id && b.resource.id !== resource.id) return false;
    return true;
  });

  // Explicit deny check
  const deny = relevant.find(b => b.effect === 'deny' || b.role === 'deny');
  if (deny) return { allow: false, reason: 'explicit-deny', binding: deny };

  // Direct roles from token (SSO) escalate baseline
  const tokenRoles = sub.roles || [];
  let maxRole: Role = 'viewer';
  for (const r of tokenRoles) if (roleOrder(r as Role) > roleOrder(maxRole)) maxRole = r as Role;
  for (const b of relevant) if (roleOrder(b.role) > roleOrder(maxRole)) maxRole = b.role;

  // Owner shortcuts
  const isOwner = (resource.owner_id && sub.user_id && resource.owner_id === sub.user_id);

  // Decision matrix
  if (maxRole === 'admin') return { allow: true, reason: 'role-admin' };
  if (maxRole === 'manager') {
    if (action === 'read' || action === 'create' || action === 'update') return { allow: true, reason: 'role-manager' };
    return { allow: false, reason: 'manager-no-delete' };
  }
  if (maxRole === 'contributor') {
    if (action === 'read') return { allow: true, reason: 'role-contributor-read' };
    if ((action === 'create') || (action === 'update' && isOwner)) return { allow: true, reason: isOwner ? 'owner-update' : 'create' };
    return { allow: false, reason: 'contributor-requires-ownership' };
  }
  // viewer
  return { allow: action === 'read', reason: action==='read' ? 'viewer-read' : 'viewer-no-write' };
}
