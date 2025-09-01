'use strict';
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function getUsage(tenant){
  const res = await pool.query('SELECT kind, sum(amount) as used FROM usage_events WHERE tenant_id=$1 AND ts > date_trunc('month', now()) GROUP BY kind', [tenant]);
  const out = {};
  for (const r of res.rows) out[r.kind] = parseInt(r.used,10);
  return out;
}
module.exports = { getUsage };
