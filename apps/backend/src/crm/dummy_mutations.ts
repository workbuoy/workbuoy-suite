import { Router } from 'express';
import type { Request, Response } from 'express';
import { createPolicyEnforcer } from '@workbuoy/backend-rbac';

// memory store for owners
const owners = new Map<string, string>(); // id -> owner_id

export const crmDummy = Router();

function requireString(name: string, value: unknown, res?: Response): string {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  if (res) {
    res.status(400).json({ error: `Missing or invalid ${name}` });
  }
  throw new Error(`Missing or invalid ${name}`);
}

crmDummy.get(
  '/contacts/:id',
  createPolicyEnforcer('read', 'record', (req) => ({ id: requireString('id', req.params?.id) })),
  (req: Request, res: Response) => {
    const id = requireString('id', req.params?.id, res);
    res.json({ id, ok: true });
  },
);

crmDummy.post(
  '/contacts',
  createPolicyEnforcer('create', 'record'),
  (req: Request, res: Response) => {
    const id = `c_${Math.random().toString(36).slice(2)}`;
    const owner = ((req as any).actor_user_id ?? 'u1') as string;
    owners.set(id, owner);
    res.status(201).json({ id, owner_id: owner });
  },
);

crmDummy.patch(
  '/contacts/:id',
  createPolicyEnforcer('update', 'record', (req) => ({
    id: requireString('id', req.params?.id),
    owner_id: String(req.header('x-owner-id') ?? 'u1'),
  })),
  (req: Request, res: Response) => {
    const id = requireString('id', req.params?.id, res);
    res.json({ id, patched: true });
  },
);

crmDummy.delete(
  '/contacts/:id',
  createPolicyEnforcer('delete', 'record', (req) => ({ id: requireString('id', req.params?.id) })),
  (req: Request, res: Response) => {
    requireString('id', req.params?.id, res);
    res.status(204).end();
  },
);
