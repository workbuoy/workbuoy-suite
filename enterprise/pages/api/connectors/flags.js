import { Pool } from 'pg';
import { withAuth } from '../../../lib/auth/oidc';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default withAuth(async function handler(req, res){
  const tenant = req.tenantId || req.user?.tenant;
  if (req.method === 'GET'){
    const r = await pool.query('SELECT connector, enabled FROM connector_flags WHERE tenant_id=$1', [tenant]);
    return res.json({ tenant, flags: r.rows });
  }
  if (req.method === 'POST'){
    const { connector, enabled } = req.body || {};
    if (!connector) return res.status(400).json({ ok:false, error:'missing_connector' });
    await pool.query(`INSERT INTO connector_flags(tenant_id, connector, enabled)
                      VALUES ($1,$2,$3)
                      ON CONFLICT (tenant_id, connector) DO UPDATE SET enabled=EXCLUDED.enabled, updated_at=now()`,
                      [tenant, connector, !!enabled]);
    return res.json({ ok:true });
  }
  res.setHeader('Allow','GET,POST'); res.status(405).end();
}, { roles: ['admin','owner'] });
