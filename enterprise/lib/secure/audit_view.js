'use strict';
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function maskPII(s){
  if (!s) return s;
  return s
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[email]')
    .replace(/\+?[0-9][0-9\s\-]{7,}[0-9]/g, '[phone]');
}

async function listMasked(limit=100){
  const erased = await pool.query('SELECT DISTINCT subject_id FROM erasure_requests');
  const subjects = new Set(erased.rows.map(r=>r.subject_id));
  const res = await pool.query('SELECT id, ts, prev_hash, payload, hash FROM worm_audit ORDER BY id DESC LIMIT $1', [limit]);
  return res.rows.map(r => {
    let payload = r.payload;
    for (const s of subjects){
      payload = payload.replaceAll(s, '[erased]');
    }
    payload = maskPII(payload);
    return { ...r, payload };
  });
}

module.exports = { listMasked };
