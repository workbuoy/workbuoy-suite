// Barrel – ensure the backend-expected public surface
export { RbacRouter } from './router.js';
export { requireRole, createPolicyEnforcer } from './middleware.js';
export { resolveRoles, upsertBinding } from './binding.js';
export { storeProxy as store } from './config.js';

// Shared types consumed by the backend
export type { PolicyRule, Role, Binding } from './types.js';

// Extended exports retained for compatibility with existing consumers
export { requireFeature } from './middleware.js';
export {
  configureRbac,
  getStore as getRbacStore,
  storeProxy,
  getAudit,
  getCounters,
  isEnforced,
} from './config.js';
export { decide } from './policy.js';
export { MemoryStore, createMemoryStore } from './store.js';
export type {
  Decision,
  RoleBinding,
  Subject,
  Store,
  ResourceResolver,
  AuditEvent,
  RbacConfiguration,
} from './types.js';
