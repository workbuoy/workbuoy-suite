import { upsertBinding, resolveRoles } from '../src/rbac/binding';

test('binding resolves roles', () => {
  upsertBinding({ tenant_id: 't1', group: 'grp-admins', role: 'admin' });
  const roles = resolveRoles('t1', ['grp-admins']);
  expect(roles.includes('admin')).toBe(true);
});
