import { Router } from 'express';
import type { Request, Response } from 'express';
import { createPolicyEnforcer } from '@workbuoy/backend-rbac';

// memory store for owners
const owners = new Map<string, string>(); // id -> owner_id

export const crmDummy = Router();

function requireParam(req: Request, key: string): string {
  const params = req.params as Record<string, string | undefined>;
  const value = params[key]?.trim() ?? '';
  if (value) {
    return value;
  }
  const error = new Error(`Missing ${key}`) as Error & { status?: number };
  error.status = 400;
  throw error;
}

crmDummy.get(
  '/contacts/:id',
  createPolicyEnforcer('read', 'record', (req: Request) => ({ id: req.params.id })),
  (req: Request, res: Response) => {
    getDummyProposal(req, res);
  }
);

crmDummy.post(
  '/contacts',
  createPolicyEnforcer('create', 'record'),
  (req: Request, res: Response) => {
    createDummyProposal(req, res);
  }
);

crmDummy.patch(
  '/contacts/:id',
  createPolicyEnforcer('update', 'record', (req: Request) => ({
    id: req.params.id,
    owner_id: String(req.header('x-owner-id') || 'u1'),
  })),
  (req: Request, res: Response) => {
    updateDummyProposal(req, res);
  }
);

crmDummy.delete(
  '/contacts/:id',
  createPolicyEnforcer('delete', 'record', (req: Request) => ({ id: req.params.id })),
  (_req: Request, res: Response) => {
    res.status(204).end();
  }
);

export interface DummyProposal {
  id: string;
  owner_id?: string;
  ok?: boolean;
  patched?: boolean;
}

export function createDummyProposal(req: Request, _res?: Response): DummyProposal {
  const id = 'c_' + Math.random().toString(36).slice(2);
  const owner = (req as unknown as { actor_user_id?: string }).actor_user_id || 'u1';
  owners.set(id, owner);
  const payload: DummyProposal = { id, owner_id: owner };
  _res?.status(201).json(payload);
  return payload;
}

export function updateDummyProposal(req: Request, _res?: Response): DummyProposal {
  const id = requireParam(req, 'id');
  const payload: DummyProposal = { id, patched: true };
  _res?.json(payload);
  return payload;
}

export function getDummyProposal(req: Request, _res?: Response): DummyProposal {
  const id = requireParam(req, 'id');
  const payload: DummyProposal = { id, ok: true };
  _res?.json(payload);
  return payload;
}
