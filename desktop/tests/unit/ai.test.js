const sqlite3 = require('sqlite3').verbose();
const { runInsights } = require('../../ai-insights');
test('insights runs without crash', async ()=>{
  const db = new sqlite3.Database(':memory:');
  await new Promise(res=> db.serialize(()=>{
    db.run('CREATE TABLE deals (id TEXT, org_id TEXT, updated_at INTEGER)');
    db.run('CREATE TABLE tickets (id TEXT, org_id TEXT, updated_at INTEGER)');
    db.run('CREATE TABLE meetings (id TEXT, org_id TEXT, updated_at INTEGER)');
    db.run(`INSERT INTO deals VALUES ('d1','o1',1)`);
    db.run(`INSERT INTO tickets VALUES ('t1','o1',1)`);
    db.run(`INSERT INTO meetings VALUES ('m1','o1',1)`);
    res();
  }));
  const rows = await runInsights(db, 'o1');
  expect(Array.isArray(rows)).toBe(true);
});
