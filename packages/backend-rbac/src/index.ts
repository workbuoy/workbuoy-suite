// Types
export type {
  Role,
  PolicyRule,
  Binding,
  Decision,
  RoleBinding,
  Subject,
  Store,
  ResourceResolver,
  AuditEvent,
  RbacConfiguration,
} from './types.js';

// Middleware / helpers
export { requireRole, createPolicyEnforcer, requireFeature } from './middleware.js';
export { resolveRoles, upsertBinding, resetBindings } from './binding.js';
export {
  configureRbac,
  getStore as getRbacStore,
  storeProxy as store,
  getAudit,
  getCounters,
  isEnforced,
} from './config.js';
export { decide } from './policy.js';
export { MemoryStore, createMemoryStore } from './store.js';

// Router
export { RbacRouter } from './router.js';
