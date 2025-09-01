import { Pool } from 'pg';
import { appendAudit } from '../../../lib/secure/audit';
import { withAuth } from '../../../lib/auth/oidc';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default withAuth(async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end();
  const { tenant, userId } = req.body || {};
  if (!tenant || !userId) return res.status(400).json({ ok:false, error:'missing_params' });
  try {
    // mask PII in tenant-specific tables (demo: mark erased)
    await pool.query("UPDATE users SET email='erased', name='erased' WHERE tenant_id=$1 AND id=$2", [tenant,userId]);
    await appendAudit({ type:'dsr_erasure', tenant, userId, result:'erased' });
    return res.status(200).json({ ok:true });
  } catch (e){
    return res.status(500).json({ ok:false, error:e.message });
  }
}, { roles:['admin'] });
