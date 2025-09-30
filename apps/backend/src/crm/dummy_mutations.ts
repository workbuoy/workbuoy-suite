import { Router } from 'express';
import type { Request, Response } from 'express';
import { createPolicyEnforcer } from '@workbuoy/backend-rbac';

// memory store for owners
const owners = new Map<string, string>(); // id -> owner_id

export const crmDummy = Router();

crmDummy.get(
  '/contacts/:id',
  createPolicyEnforcer('read', 'record', (req: Request) => ({ id: req.params.id })),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id, ok: true });
  }
);

crmDummy.post(
  '/contacts',
  createPolicyEnforcer('create', 'record'),
  (req: Request, res: Response) => {
    const id = 'c_' + Math.random().toString(36).slice(2);
    const owner = (req as unknown as { actor_user_id?: string }).actor_user_id || 'u1';
    owners.set(id, owner);
    res.status(201).json({ id, owner_id: owner });
  }
);

crmDummy.patch(
  '/contacts/:id',
  createPolicyEnforcer('update', 'record', (req: Request) => ({
    id: req.params.id,
    owner_id: String(req.header('x-owner-id') || 'u1'),
  })),
  (req: Request, res: Response) => {
    res.json({ id: req.params.id, patched: true });
  }
);

crmDummy.delete(
  '/contacts/:id',
  createPolicyEnforcer('delete', 'record', (req: Request) => ({ id: req.params.id })),
  (_req: Request, res: Response) => {
    res.status(204).end();
  }
);
