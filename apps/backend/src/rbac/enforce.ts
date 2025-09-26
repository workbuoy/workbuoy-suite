import { requireRole } from '@workbuoy/backend-rbac';

/**
 * @deprecated Use `requireRole` from `@workbuoy/backend-rbac`.
 */
export function enforce(required: 'read' | 'write' | 'admin') {
  const role = required === 'admin' ? 'admin' : required === 'write' ? 'contributor' : 'viewer';
  return requireRole(role);
}
