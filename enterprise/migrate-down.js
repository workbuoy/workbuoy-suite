import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const MIG_DIR = path.join(process.cwd(),'db','migrations');

async function run(){
  const db = new sqlite3.Database(DB_PATH);
  const applied = await listApplied(db);
  if(applied.length === 0){ console.log('No migrations to rollback.'); process.exit(0); }
  const last = applied[applied.length - 1];
  const downPath = path.join(MIG_DIR, last.replace('.sql','.down.sql'));
  if(!fs.existsSync(downPath)){ console.error('No down file for', last); process.exit(1); }
  const sql = fs.readFileSync(downPath,'utf8');
  try{
    await runSql(db, 'BEGIN');
    await runSql(db, sql);
    await runSql(db, `DELETE FROM _migrations WHERE name=?`, [last]);
    await runSql(db, 'COMMIT');
    console.log('Rolled back', last);
  }catch(e){
    await runSql(db, 'ROLLBACK');
    console.error('Rollback failed', e);
    process.exit(1);
  } finally {
    db.close();
  }
}

function listApplied(db){
  return new Promise((resolve)=> db.all(`SELECT name FROM _migrations ORDER BY id`, [], (e, rows)=> resolve(rows ? rows.map(r=>r.name) : [])));
}
function runSql(db, sql, params=[]){ return new Promise((resolve,reject)=> db.run(sql, params, function(err){ if(err) reject(err); else resolve(); })); }

run();
