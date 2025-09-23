import { canRead, canWrite, type Subject } from '../src/rbac/policy';

const tenant = 't1';
const otherTenant = 't2';

const ownerId = 'u123';

const mkSub = (roles: any[]): Subject => ({
  userId: 'u123',
  tenantId: tenant,
  roles,
  ownsRecord: (rid) => rid === ownerId
});

const resource = (owner: string | null) => ({
  kind: 'opportunity' as const,
  tenant_id: tenant,
  owner_id: owner
});

test('admin full access', () => {
  const sub = mkSub(['admin']);
  expect(canRead(sub, resource(ownerId))).toBe(true);
  expect(canWrite(sub, resource(null))).toBe(true);
});

test('manager full access in tenant', () => {
  const sub = mkSub(['manager']);
  expect(canRead(sub, resource(ownerId))).toBe(true);
  expect(canWrite(sub, resource(null))).toBe(true);
});

test('contributor can write own only', () => {
  const sub = mkSub(['contributor']);
  expect(canRead(sub, resource(ownerId))).toBe(true);
  expect(canWrite(sub, resource(ownerId))).toBe(true);
  expect(canWrite(sub, resource('someone-else'))).toBe(false);
});

test('viewer read-only', () => {
  const sub = mkSub(['viewer']);
  expect(canRead(sub, resource(ownerId))).toBe(true);
  expect(canWrite(sub, resource(ownerId))).toBe(false);
});

test('cross-tenant denied', () => {
  const sub = { ...mkSub(['admin']), tenantId: otherTenant } as Subject;
  expect(canRead(sub, { kind: 'contact', tenant_id: tenant, owner_id: null })).toBe(false);
  expect(canWrite(sub, { kind: 'contact', tenant_id: tenant, owner_id: null })).toBe(false);
});