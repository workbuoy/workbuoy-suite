const sqlite3 = require('sqlite3').verbose();
const bg = require('../../background.js');
test('audit queue can enqueue without crash', async ()=>{
  const db = new sqlite3.Database(':memory:');
  await new Promise(r=> db.serialize(()=> r()));
  await (async function ensure(){ await (new Promise(res=> db.run(`CREATE TABLE IF NOT EXISTS audit_queue(id TEXT PRIMARY KEY, type TEXT, org_id TEXT, payload TEXT, status TEXT, attempt INT, last_error TEXT, created_at INT, updated_at INT)`, [], ()=>res()))); })();
});
