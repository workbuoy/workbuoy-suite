import { persistenceEnabled } from '../core/config/dbFlag';
import { RoleRegistry } from './registry';
import { loadFeaturesFromRepo, loadRolesFromRepo } from './loader';
import type { UserRoleBinding } from './types';
import { RoleRepo } from './db/RoleRepo';
import { FeatureRepo } from './db/FeatureRepo';
import { OverrideRepo } from './db/OverrideRepo';
import { UserRoleRepo } from './db/UserRoleRepo';

let cached: { registry: RoleRegistry; mode: 'db' | 'memory'; loadedAt: number } | undefined;
const TTL_MS = 5_000;

async function buildDbRegistry(): Promise<RoleRegistry> {
  const [roles, features, overrides] = await Promise.all([
    new RoleRepo().listRoles(),
    new FeatureRepo().listFeatures(),
    new OverrideRepo().listOverrides(),
  ]);
  return new RoleRegistry(roles, features, overrides);
}

async function buildMemoryRegistry(): Promise<RoleRegistry> {
  return new RoleRegistry(loadRolesFromRepo(), loadFeaturesFromRepo(), []);
}

export async function getRoleRegistry(force = false): Promise<RoleRegistry> {
  const mode: 'db' | 'memory' = persistenceEnabled() ? 'db' : 'memory';
  const now = Date.now();
  if (!cached || cached.mode !== mode || force || now - cached.loadedAt > TTL_MS) {
    const registry = mode === 'db' ? await buildDbRegistry() : await buildMemoryRegistry();
    cached = { registry, mode, loadedAt: now };
  }
  return cached.registry;
}

export async function resolveUserBinding(
  userId: string,
  fallbackRole: string,
  secondaryRoles?: string[]
): Promise<UserRoleBinding> {
  if (persistenceEnabled()) {
    const repo = new UserRoleRepo();
    const binding = await repo.getBinding(userId);
    if (binding) return binding;
    const fallback = { userId, primaryRole: fallbackRole, secondaryRoles };
    await repo.setBinding(fallback);
    return fallback;
  }
  return { userId, primaryRole: fallbackRole, secondaryRoles };
}

export async function persistUserBinding(binding: UserRoleBinding): Promise<void> {
  if (!persistenceEnabled()) return;
  const repo = new UserRoleRepo();
  await repo.setBinding(binding);
}
