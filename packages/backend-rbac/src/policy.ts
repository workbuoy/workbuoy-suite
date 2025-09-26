import type { Action, Decision, ResourceKind, Role, Store, Subject } from './types.js';

function roleOrder(role: Role | 'deny'): number {
  return ['viewer', 'contributor', 'manager', 'admin', 'deny'].indexOf(role);
}

export async function decide(
  store: Store,
  sub: Subject,
  action: Action,
  resource: { kind: ResourceKind; id?: string | null; owner_id?: string | null },
): Promise<Decision> {
  const bindings = await store.listBindings(sub.tenant_id);
  const subjectGroups = new Set(sub.groups ?? []);
  const subjectUser = sub.user_id ?? null;

  const relevant = bindings.filter((binding) => {
    if (binding.tenant_id !== sub.tenant_id) return false;
    if (binding.user_id && binding.user_id !== subjectUser) return false;
    if (binding.group && !subjectGroups.has(binding.group)) return false;
    if (!binding.resource) return true;
    if (binding.resource.kind !== resource.kind) return false;
    if (binding.resource.id && resource.id && binding.resource.id !== resource.id) return false;
    return true;
  });

  const deny = relevant.find((binding) => binding.effect === 'deny' || binding.role === 'deny');
  if (deny) {
    return { allow: false, reason: 'explicit-deny', binding: deny };
  }

  const tokenRoles = sub.roles ?? [];
  let maxRole: any = 'viewer';
  for (const role of tokenRoles) {
    if (roleOrder(role) > roleOrder(maxRole)) {
      maxRole = role;
    }
  }
  for (const binding of relevant) {
    if (roleOrder(binding.role) > roleOrder(maxRole)) {
      maxRole = binding.role;
    }
  }

  const isOwner = Boolean(resource.owner_id && sub.user_id && resource.owner_id === sub.user_id);

  if (maxRole === 'admin') return { allow: true, reason: 'role-admin' };
  if (maxRole === 'manager') {
    if (action === 'read' || action === 'create' || action === 'update') {
      return { allow: true, reason: 'role-manager' };
    }
    return { allow: false, reason: 'manager-no-delete' };
  }
  if (maxRole === 'contributor') {
    if (action === 'read') return { allow: true, reason: 'role-contributor-read' };
    if (action === 'create') return { allow: true, reason: 'create' };
    if (action === 'update' && isOwner) return { allow: true, reason: 'owner-update' };
    return { allow: false, reason: 'contributor-requires-ownership' };
  }

  return { allow: action === 'read', reason: action === 'read' ? 'viewer-read' : 'viewer-no-write' };
}
