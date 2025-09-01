
// lib/db/sqlite.js
const __Database_mod = await import('better-sqlite3'); const Database = __Database_mod.default || __Database_mod;
const __path_mod = await import('path'); const path = __path_mod.default || __path_mod;
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'db', 'workbuoy.db');
const db = new Database(dbPath);

function exec(sql){ db.exec(sql); }
function query(text, params=[]){
  // very basic support; replace $1,$2 with ?
  const q = text.replace(/\$\d+/g,'?');
  const stmt = db.prepare(q);
  const isSelect = /^\s*select/i.test(text);
  if(isSelect){ return { rows: stmt.all(params) }; }
  else { const info = stmt.run(params); return { rowCount: info.changes }; }
}

module.exports = { db, exec, query };
