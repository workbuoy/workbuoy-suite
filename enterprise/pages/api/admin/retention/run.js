
import { getRole } from '../../../../lib/auth/rbac.js';
import { exec } from 'child_process';
export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id']||'demo-tenant';
  const user_id = req.headers['x-user-id']||'';
  const role = await getRole(tenant_id, user_id);
  if(role!=='admin') return res.status(403).json({error:'forbidden'});
  exec('node scripts/retention/run.js', (err, stdout, stderr)=>{
    if(err) return res.status(500).json({error:'retention_failed'});
    res.json({ok:true});
  });
}
