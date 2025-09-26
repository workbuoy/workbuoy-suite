import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { MemoryStore } from '../src/store.js';
import { decide } from '../src/policy.js';
import type { RoleBinding } from '../src/types.js';

const seed: RoleBinding[] = [
  {
    id: '1',
    tenant_id: 't1',
    role: 'manager',
    created_at: Date.now(),
  },
  {
    id: '2',
    tenant_id: 't1',
    role: 'deny',
    effect: 'deny',
    created_at: Date.now(),
    resource: { kind: 'record', id: 'rec-blocked' },
  },
];

const store = new MemoryStore();
await Promise.all(seed.map((binding) => store.upsert(binding)));

test('manager grants read/update but not delete', async () => {
  const decision = await decide(
    store,
    { tenant_id: 't1', user_id: 'u1', roles: [] },
    'update',
    { kind: 'record', id: 'rec-1', owner_id: 'u1' },
  );
  assert.equal(decision.allow, true);
  assert.equal(decision.reason, 'role-manager');

  const deleteDecision = await decide(
    store,
    { tenant_id: 't1', user_id: 'u1', roles: [] },
    'delete',
    { kind: 'record', id: 'rec-1', owner_id: 'u1' },
  );
  assert.equal(deleteDecision.allow, false);
  assert.equal(deleteDecision.reason, 'manager-no-delete');
});

test('explicit deny takes precedence', async () => {
  const decision = await decide(
    store,
    { tenant_id: 't1', user_id: 'u1', roles: ['manager'] },
    'read',
    { kind: 'record', id: 'rec-blocked', owner_id: 'u1' },
  );
  assert.equal(decision.allow, false);
  assert.equal(decision.reason, 'explicit-deny');
});
