import { enqueue, registerWorker } from '../../../lib/queue/index.js';
import { getRole } from '../../../lib/auth/rbac.js';
import { appendAudit } from '../../../lib/audit/store.js';

export default async function handler(req,res){
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const user_id = req.headers['x-user-id'] || '';
  const role = await getRole(tenant_id, user_id);
  if(role!=='admin') return res.status(403).json({ error:'forbidden' });
  const { connector } = req.body||{};
  if(!connector) return res.status(400).json({ error:'missing_connector' });
  await enqueue('workbuoy', 'resync', { tenant_id, connector });
  await appendAudit({ tenant_id, user_id, action:'resync_enqueued', target: connector });
  res.json({ ok:true, enqueued:true, connector });
}

// Register a default in-memory worker for dev
registerWorker('workbuoy', async (job, data)=>{
  if(job==='resync'){
    // no-op: in real env, call connector runner by name
  }
});
