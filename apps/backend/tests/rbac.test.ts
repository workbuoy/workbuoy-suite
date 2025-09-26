import { decide, MemoryStore, type Subject } from '@workbuoy/backend-rbac';

const tenant = 't1';
const otherTenant = 't2';

const ownerId = 'u123';

const store = new MemoryStore();

const mkSub = (roles: any[]): Subject => ({
  user_id: 'u123',
  tenant_id: tenant,
  roles: roles as any,
});

const resource = (owner: string | null) => ({
  kind: 'record' as const,
  tenant_id: tenant,
  owner_id: owner,
});

async function canRead(sub: Subject, res: ReturnType<typeof resource>) {
  const decision = await decide(store, sub, 'read', res as any);
  return decision.allow;
}

async function canWrite(sub: Subject, res: ReturnType<typeof resource>) {
  const decision = await decide(store, sub, 'update', res as any);
  return decision.allow;
}

test('admin full access', async () => {
  const sub = mkSub(['admin']);
  expect(await canRead(sub, resource(ownerId))).toBe(true);
  expect(await canWrite(sub, resource(null))).toBe(true);
});

test('manager full access in tenant', async () => {
  const sub = mkSub(['manager']);
  expect(await canRead(sub, resource(ownerId))).toBe(true);
  expect(await canWrite(sub, resource(null))).toBe(true);
});

test('contributor can write own only', async () => {
  const sub = mkSub(['contributor']);
  expect(await canRead(sub, resource(ownerId))).toBe(true);
  expect(await canWrite(sub, resource(ownerId))).toBe(true);
  expect(await canWrite(sub, resource('someone-else'))).toBe(false);
});

test('viewer read-only', async () => {
  const sub = mkSub(['viewer']);
  expect(await canRead(sub, resource(ownerId))).toBe(true);
  expect(await canWrite(sub, resource(ownerId))).toBe(false);
});

test('cross-tenant denied', async () => {
  const sub = { ...mkSub(['admin']), tenant_id: otherTenant } as Subject;
  expect(await canRead(sub, { kind: 'record', tenant_id: tenant, owner_id: null })).toBe(false);
  expect(await canWrite(sub, { kind: 'record', tenant_id: tenant, owner_id: null })).toBe(false);
});