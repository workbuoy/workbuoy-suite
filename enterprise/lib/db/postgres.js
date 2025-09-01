
// lib/db/postgres.js
const { Pool } = require('pg');

const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl
});

async function query(text, params=[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } finally {
    const ms = Date.now() - start;
    try { require('../metrics').pgObserveLatencyMs(ms, 'query'); } catch(_) {}
  }
}

// Exec multiple statements separated by ';'
async function exec(sql){
  const statements = sql.split(';').map(s=>s.trim()).filter(Boolean);
  const client = await pool.connect();
  const start = Date.now();
  try{
    await client.query('BEGIN');
    for(const st of statements){ await client.query(st); }
    await client.query('COMMIT');
  }catch(e){
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    const ms = Date.now() - start;
    try { require('../metrics').pgObserveLatencyMs(ms, 'exec'); } catch(_){}
  }
}

module.exports = { pool, query, exec };
