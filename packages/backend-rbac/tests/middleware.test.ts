import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { Request, Response } from 'express';
import { createPolicyEnforcer, configureRbac, requireRole } from '../src/index.js';
import { MemoryStore } from '../src/store.js';

function createMockRes() {
  const res: Partial<Response> & { statusCode: number; payload?: unknown } = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this as Response;
    },
    json(body: unknown) {
      this.payload = body;
      return this as Response;
    },
    end() {
      return this as Response;
    },
  };
  return res as Response & { statusCode: number; payload?: unknown };
}

test('policy enforcer denies when subject lacks role', async () => {
  const store = new MemoryStore();
  await store.upsert({ tenant_id: 't1', role: 'manager', id: '1', created_at: Date.now() });
  const denied: unknown[] = [];
  configureRbac({
    store,
    counters: {
      denied: { inc: () => denied.push('denied') },
    },
  });
  const middleware = createPolicyEnforcer('delete', 'record', () => ({ id: 'r1' }));
  const req = {
    method: 'POST',
    header: () => null,
    tenant_id: 't1',
    actor_user_id: 'u1',
    roles: ['viewer'],
  } as unknown as Request;
  const res = createMockRes();
  let called = false;
  await middleware(req, res, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(denied, ['denied']);
});

test('requireRole allows higher-ranked roles', async () => {
  const store = new MemoryStore();
  configureRbac({ store });
  const middleware = requireRole('contributor');
  const req = {
    header: () => null,
    roles: ['manager'],
  } as unknown as Request;
  const res = createMockRes();
  let called = false;
  await middleware(req, res, () => {
    called = true;
  });
  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});
