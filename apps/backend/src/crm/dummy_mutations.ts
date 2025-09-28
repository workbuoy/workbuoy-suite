import express from 'express';
import { createPolicyEnforcer } from '@workbuoy/backend-rbac';

// memory store for owners
const owners = new Map<string, string>(); // id -> owner_id

export const crmDummy = express.Router();

crmDummy.get('/contacts/:id', createPolicyEnforcer('read','record', (req)=>({ id: req.params.id })), (req, res)=>{
  res.json({ id: req.params.id, ok: true });
});

crmDummy.post('/contacts', createPolicyEnforcer('create','record'), (req, res)=>{
  const id = 'c_'+Math.random().toString(36).slice(2);
  const owner = (req as any).actor_user_id || 'u1';
  owners.set(id, owner);
  res.status(201).json({ id, owner_id: owner });
});

crmDummy.patch('/contacts/:id', createPolicyEnforcer('update','record', (req)=>({ id: req.params.id, owner_id: String(req.header('x-owner-id')||'u1') })), (req, res)=>{
  res.json({ id: req.params.id, patched: true });
});

crmDummy.delete('/contacts/:id', createPolicyEnforcer('delete','record', (req)=>({ id: req.params.id })), (req, res)=>{
  res.status(204).end();
});
