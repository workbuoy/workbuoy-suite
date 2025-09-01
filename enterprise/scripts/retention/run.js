
const path = require('path'); const sqlite3 = require('sqlite3');
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const db = new sqlite3.Database(DB_PATH);
db.all(`SELECT table_name, ttl_days FROM retention_policy`, (e, rows)=>{
  if(e||!rows) process.exit(0);
  rows.forEach(r=>{
    const cutoff = `datetime('now','-${r.ttl_days} days')`;
    // best-effort: expect tables have 'ts' column
    db.run(`DELETE FROM ${r.table_name} WHERE ts < ${cutoff}`);
  });
});
