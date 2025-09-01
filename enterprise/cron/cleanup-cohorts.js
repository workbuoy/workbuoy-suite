
// Purge cohort stats older than 90 days
import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const db = new sqlite3.Database(DB_PATH);
db.serialize(()=>{
  db.run(`DELETE FROM signals WHERE datetime(ts) < datetime('now','-90 day')`);
});
db.close();
