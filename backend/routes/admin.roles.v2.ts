import { Router } from 'express';
import { policyGuardWrite } from '../../src/core/policy/guard';
import { RoleRepoV2 } from '../../src/roles/db/RoleRepo.v2';
import { OverrideRepoV2 } from '../../src/roles/db/OverrideRepo.v2';

const r = Router();
const adminOnly = policyGuardWrite('admin');

r.post('/admin/roles/import', adminOnly, async (req:any,res,next)=>{
  try{
    const rows = (req.body && Array.isArray(req.body.roles)) ? req.body.roles : [];
    const repo = await RoleRepoV2.open();
    for(const row of rows){ await repo.upsert(row); }
    res.json({ ok:true, imported: rows.length });
  }catch(e){ next(e); }
});

r.put('/admin/roles/:roleId/overrides', adminOnly, async (req:any,res,next)=>{
  try{
    const tenant = String(req.headers['x-tenant'] || req.headers['x-tenant-id'] || 'T1');
    const roleId = String(req.params.roleId);
    const repo = await OverrideRepoV2.open();
    await repo.set(tenant, roleId, req.body?.feature_caps || {}, req.body?.disabled_features || []);
    res.json({ ok:true });
  }catch(e){ next(e); }
});

r.get('/admin/roles/:roleId', adminOnly, async (req:any,res,next)=>{
  try{
    const tenant = String(req.headers['x-tenant'] || req.headers['x-tenant-id'] || 'T1');
    const roleId = String(req.params.roleId);
    const roleRepo = await RoleRepoV2.open();
    const overrideRepo = await OverrideRepoV2.open();
    const role = await roleRepo.get(roleId);
    const override = await overrideRepo.get(tenant, roleId);
    res.json({ ok:true, role, override });
  }catch(e){ next(e); }
});

export default r;
