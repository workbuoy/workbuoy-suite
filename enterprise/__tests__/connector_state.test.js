const path = require('path');
process.env.DB_PATH = path.join(process.cwd(),'db','test_connstate.db');
const fs = require('fs');
const sqlite3 = require('sqlite3');

// create table
const db = new sqlite3.Database(process.env.DB_PATH);
beforeAll((done)=>{
  db.run(`CREATE TABLE IF NOT EXISTS connector_state(
    tenant_id TEXT NOT NULL,
    connector TEXT NOT NULL,
    key TEXT NOT NULL,
    state TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(tenant_id, connector, key)
  )`, ()=>done());
});

test('setState/getState works (sqlite fallback)', async ()=>{
  const { getState, setState } = require('../lib/db/state.js');
  await setState('t1','Jira','2025-08-01T00:00:00Z','since');
  const v = await getState('t1','Jira','since');
  expect(v).toBe('2025-08-01T00:00:00Z');
});
