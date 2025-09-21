import { Router } from 'express';
import { policyGuardWrite } from '../../src/core/policy/guard';

const r = Router();
const adminOnly = policyGuardWrite('admin');

let sub = { plan: 'flex', entitlements: [], killSwitch: false, secureTenant: false } as any;

r.get('/admin/subscription', (_req,res)=> res.json(sub));

r.put('/admin/subscription', adminOnly, (req,res)=>{
  const { plan, entitlements, killSwitch, secureTenant } = req.body || {};
  if (plan) sub.plan = plan;
  if (Array.isArray(entitlements)) sub.entitlements = entitlements;
  if (typeof killSwitch === 'boolean') sub.killSwitch = killSwitch;
  if (typeof secureTenant === 'boolean') sub.secureTenant = secureTenant;
  res.json({ ok:true, sub });
});

export default r;
