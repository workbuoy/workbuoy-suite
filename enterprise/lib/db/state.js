'use strict';
let PG = null, SQLITE3 = null, usePg = false;
try { PG = require('pg'); } catch(_){}
try { SQLITE3 = require('sqlite3'); } catch(_){}

const { gauges } = require('../metrics/registry');

let pool = null;
if (process.env.DATABASE_URL && PG) {
  usePg = true;
  const { Pool } = PG;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

const path = require('path');
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function sqliteDb(){
  const db = new SQLITE3.Database(DB_PATH);
  return db;
}

async function getState(tenant, connector, key='since'){
  if (usePg){
    const res = await pool.query('SELECT state FROM connector_state WHERE tenant_id=$1 AND connector=$2 AND key=$3', [tenant, connector, key]);
    return res.rows[0]?.state || null;
  } else {
    return await new Promise((resolve,reject)=>{
      const db = sqliteDb();
      db.get('SELECT state FROM connector_state WHERE tenant_id=? AND connector=? AND key=?', [tenant, connector, key], (e,row)=>{
        if(e) return resolve(null);
        resolve(row?.state || null);
      });
    });
  }
}

async function setState(tenant, connector, value, key='since'){
  const tsSec = Math.floor(Date.now()/1000);
  if (usePg){
    await pool.query(`
      INSERT INTO connector_state (tenant_id, connector, key, state, updated_at)
      VALUES ($1,$2,$3,$4, NOW())
      ON CONFLICT (tenant_id, connector, key)
      DO UPDATE SET state=EXCLUDED.state, updated_at=NOW()
    `, [tenant, connector, key, value]);
  } else {
    await new Promise((resolve)=>{
      const db = sqliteDb();
      db.run(`INSERT INTO connector_state(tenant_id,connector,key,state,updated_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP)
              ON CONFLICT(tenant_id,connector,key) DO UPDATE SET state=excluded.state, updated_at=CURRENT_TIMESTAMP`,
              [tenant, connector, key, value], (_)=> resolve());
    });
  }
  try{ gauges.connector_last_sync.labels({ connector, tenant }).set(tsSec); }catch(_){}
}

module.exports = { getState, setState };
