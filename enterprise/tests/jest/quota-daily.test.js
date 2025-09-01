/* @jest-environment node */
test('Daily events quota blocks when exceeded', async () => {
  const mod = await import('../../lib/middleware/tenant-rate-limit.js');
  // Mock usage counter by writing directly to DB
  const sqlite3 = (await import('sqlite3')).default; const path = (await import('path')).default;
  const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
  const db = new sqlite3.Database(DB_PATH);
  const day = new Date().toISOString().slice(0,10);
  await new Promise(r=> db.run(`INSERT OR REPLACE INTO usage_counters(tenant_id,counter_name,day,count) VALUES(?,?,?,?)`, ['tq','events',day,999999], ()=>r()));
  const req = { headers:{}, tenant_id:'tq' }; let s=0,b=null; const res = { status:(x)=>{s=x; return res;}, json:(x)=>{b=x;} };
  const blocked = await mod.enforceDailyEventsQuota(req,res,'tq', 1000);
  expect(blocked).toBe(true);
  expect(s).toBe(429);
});
