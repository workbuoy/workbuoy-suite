// Idempotent DB bootstrap for columns/indexes introduced in 005/006
const log = require('../logger');
function hasColumn(db, table, column) {
  return new Promise((resolve)=> db.all(`PRAGMA table_info(${table})`, [], (e, rows)=>{
    if (e) { resolve(false); return; }
    resolve((rows||[]).some(r => String(r.name).toLowerCase() === String(column).toLowerCase()));
  }));
}
function addColumn(db, table, column, type) {
  return new Promise((resolve)=> db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, [], ()=> resolve()));
}
function createIndex(db, sql) {
  return new Promise((resolve)=> db.run(sql, [], ()=> resolve()));
}

async function ensureColumnsAndIndexes(db) {
  const colWork = [];
  const addIfMissing = async (t,c,typ)=> { if (!(await hasColumn(db,t,c))) await addColumn(db,t,c,typ); };
  // 005: org_id on domain tables
  for (const t of ['messages','customers','calendar','tasks','deals','tickets','meetings']) {
    colWork.push(addIfMissing(t,'org_id','TEXT'));
  }
  await Promise.all(colWork).catch(()=>{});

  // Indexes
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_messages_org_updated  ON messages(org_id, updated_at)`);
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_customers_org_updated ON customers(org_id, updated_at)`);
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_calendar_org_updated  ON calendar(org_id, updated_at)`);
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_tasks_org_updated     ON tasks(org_id, updated_at)`);
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_deals_org_updated     ON deals(org_id, updated_at)`);
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_tickets_org_updated   ON tickets(org_id, updated_at)`);
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_meetings_org_updated  ON meetings(org_id, updated_at)`);

  // 006: sync_queue org_id, wf_id, step_index + indexes
  await addIfMissing('sync_queue','org_id','TEXT');
  await addIfMissing('sync_queue','wf_id','TEXT');
  await addIfMissing('sync_queue','step_index','INTEGER DEFAULT 0');
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_sync_queue_org_status ON sync_queue(org_id, status, updated_at)`);
  await createIndex(db, `CREATE INDEX IF NOT EXISTS idx_sync_queue_wf         ON sync_queue(wf_id, step_index, status)`);
  log.info('DB bootstrap completed (idempotent)');
}

module.exports = { ensureColumnsAndIndexes };
