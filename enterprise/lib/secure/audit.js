'use strict';
const crypto = require('crypto');
const { Pool } = require('pg');
const { notifyCritical } = require('./siem');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function hash(s){ return crypto.createHash('sha256').update(s).digest('hex'); }

async function appendAudit(event){
  const now = new Date().toISOString();
  const payload = JSON.stringify({ ...event, ts: now });
  const prev = await pool.query('SELECT hash FROM worm_audit ORDER BY id DESC LIMIT 1');
  const prevHash = prev.rows[0]?.hash || ''.padEnd(64, '0');
  const chainInput = prevHash + '|' + payload;
  const h = hash(chainInput);
  await pool.query('INSERT INTO worm_audit (ts, prev_hash, payload, hash) VALUES ($1,$2,$3,$4)', [now, prevHash, payload, h]);
  // Fanout to SIEM
  notifyCritical({ type: 'audit_event', hash: h, prev_hash: prevHash, payload: JSON.parse(payload) }).catch(()=>{});
  return h;
}

async function verifyChain(limit=1000){
  const res = await pool.query('SELECT id, prev_hash, payload, hash FROM worm_audit ORDER BY id ASC LIMIT $1', [limit]);
  let last = ''.padEnd(64, '0');
  for (const row of res.rows){
    const h = hash(last + '|' + row.payload);
    if (h !== row.hash) return false;
    last = row.hash;
  }
  return true;
}

module.exports = { appendAudit, verifyChain };
