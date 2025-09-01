import { Pool } from 'pg';
import { withAuth } from '../../lib/auth/oidc';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default withAuth(async function handler(req, res){
  const tenant = req.user?.tenant || req.tenantId;
  const usage = await pool.query("SELECT kind, SUM(amount)::int as used FROM usage_events WHERE tenant_id=$1 AND ts >= date_trunc('month', now()) GROUP BY kind", [tenant]);
  const quotas = await pool.query("SELECT plan, limit_monthly_events, limit_connectors FROM quotas WHERE tenant_id=$1", [tenant]);
  res.json({ tenant, usage: usage.rows, quotas: quotas.rows[0] || null });
});
