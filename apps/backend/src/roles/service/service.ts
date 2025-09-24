import type { FeatureDef, OrgRoleOverride, RoleProfile, UserRoleBinding } from '../types.js';
import { loadServiceModule } from './loader.js';

async function callServiceFunction<T>(name: string, args: unknown[]): Promise<T> {
  const mod = await loadServiceModule();
  const fn = (mod as Record<string, unknown>)[name];
  if (typeof fn !== 'function') {
    throw new Error(`${name} export missing from src/roles/service`);
  }
  return (fn as (...inner: unknown[]) => Promise<T>)(...args);
}

export async function getRoleRegistry(opts: { refresh?: boolean } = {}): Promise<unknown> {
  return callServiceFunction('getRoleRegistry', [opts]);
}

export async function resolveUserBinding(
  tenantId: string,
  userId: string,
  fallback: UserRoleBinding | undefined
): Promise<UserRoleBinding | undefined> {
  return callServiceFunction('resolveUserBinding', [tenantId, userId, fallback]);
}

export async function setOverride(
  tenantId: string,
  roleId: string,
  override: Partial<OrgRoleOverride>
): Promise<OrgRoleOverride> {
  return callServiceFunction('setOverride', [tenantId, roleId, override]);
}

export async function listOverridesForTenant(tenantId: string): Promise<OrgRoleOverride[]> {
  return callServiceFunction('listOverridesForTenant', [tenantId]);
}

export async function refreshRoleRegistry(): Promise<unknown> {
  return callServiceFunction('refreshRoleRegistry', []);
}

export async function listRoles(): Promise<RoleProfile[]> {
  return callServiceFunction('listRoles', []);
}

export async function listFeatures(): Promise<FeatureDef[]> {
  return callServiceFunction('listFeatures', []);
}

export async function upsertRoleBinding(
  tenantId: string,
  binding: UserRoleBinding
): Promise<UserRoleBinding> {
  return callServiceFunction('upsertRoleBinding', [tenantId, binding]);
}
