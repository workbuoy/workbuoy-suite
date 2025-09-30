import type { Action, ResourceKind, Role } from './types.js';

export { MemoryStore, createMemoryStore } from './store.js';
export {
  configureRbac,
  getStore as getRbacStore,
  storeProxy as store,
  getAudit,
  getCounters,
  isEnforced,
} from './config.js';
export { decide } from './policy.js';
export { createPolicyEnforcer, requireRole, requireFeature } from './middleware.js';
export { RbacRouter } from './router.js';
export { resolveRoles, upsertBinding, resetBindings } from './binding.js';
export type {
  Action,
  Role,
  ResourceKind,
  Decision,
  RoleBinding,
  Subject,
  Store,
  ResourceResolver,
  AuditEvent,
  RbacConfiguration,
} from './types.js';
export type { GroupBinding as Binding } from './binding.js';

export type PolicyRule = {
  action: Action;
  resource: ResourceKind;
  role: Role;
};
