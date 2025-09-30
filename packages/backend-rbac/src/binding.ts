import type { Binding, Role } from './types.js';

const bindings: Binding[] = [];

export function upsertBinding(binding: Binding): Binding {
  const idx = bindings.findIndex(
    (item) =>
      item.tenant_id === binding.tenant_id &&
      item.group === binding.group &&
      item.role === binding.role &&
      item.resource?.id === binding.resource?.id,
  );
  if (idx >= 0) {
    bindings[idx] = binding;
  } else {
    bindings.push(binding);
  }
  return binding;
}

export function resolveRoles(tenant_id: string, groups: string[]): Role[] {
  const roles = new Set<Role>();
  for (const group of groups) {
    bindings
      .filter((binding) => binding.tenant_id === tenant_id && binding.group === group)
      .forEach((binding) => roles.add(binding.role));
  }
  if (roles.size === 0) {
    roles.add('viewer');
  }
  return Array.from(roles);
}

export function resetBindings() {
  bindings.splice(0, bindings.length);
}
