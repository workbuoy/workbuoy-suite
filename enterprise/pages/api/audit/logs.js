import { requireRole } from '../../../lib/auth/rbac.js';
import { listAudit } from '../../../lib/audit/store.js';

export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  // naive middleware call
  const allow = await (async ()=>{
    // emulate next() with inline check
    const role = await (await import('../../../lib/auth/rbac.js')).then(m=>m.getRole(tenant_id, req.headers['x-user-id']||''));
    return role === 'admin';
  })();
  if(!allow) return res.status(403).json({ error:'forbidden' });
  const limit = parseInt(String(req.query.limit||'100'),10);
  const rows = await listAudit({ tenant_id, limit: isNaN(limit)?100:limit });
  res.json({ ok:true, rows });
}
