import { Pool } from 'pg';
import { withAuth } from '../../../lib/auth/oidc';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default withAuth(async function handler(req, res){
  const tenant = req.tenantId || req.user?.tenant;
  const state = await pool.query("SELECT connector, state as since FROM connector_state WHERE tenant_id=$1", [tenant]);
  const audit = await pool.query("SELECT (payload::json)->>'connector' as connector, (payload::json)->>'count' as count, ts FROM worm_audit WHERE (payload LIKE '%connector_sync%') ORDER BY ts DESC LIMIT 500");
  const errors = await pool.query("SELECT (payload::json)->>'connector' as connector, ts, (payload::json)->>'error' as error FROM worm_audit WHERE (payload LIKE '%connector_error%') ORDER BY ts DESC LIMIT 200");
  res.json({ tenant, state: state.rows, recentSyncs: audit.rows, recentErrors: errors.rows });
}, { roles: ['admin','owner'] });
