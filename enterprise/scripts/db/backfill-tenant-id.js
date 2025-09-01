// Backfill tenant_id for existing rows (sqlite dev default).
// Heuristics: join via user_email when available; else set to 'enterprise' or env WB_DEFAULT_TENANT.
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const DEFAULT_TENANT = (process.env.WB_DEFAULT_TENANT || 'enterprise').toLowerCase();

const tables = [
  { name: 'audit_logs_worm', emailCol: 'user_email' },
  { name: 'subscriptions', emailCol: 'user_email' },
  { name: 'usage_events', emailCol: 'user_email' },
  { name: 'tickets', emailCol: 'requester_email' },
  { name: 'ai_actions_log', emailCol: 'user_email' },
  { name: 'ai_tasks', emailCol: 'user_email' },
  { name: 'kb_documents', emailCol: 'owner_email' },
  { name: 'ai_feedback', emailCol: 'user_email' },
  { name: 'ai_suggestions', emailCol: 'user_email' },
  { name: 'ai_suggestions_actions', emailCol: 'user_email' },
  { name: 'purchases', emailCol: 'buyer_email' },
  { name: 'magic_links', emailCol: 'email' }
];

function run(db, sql, params=[]) {
  return new Promise((resolve) => db.run(sql, params, () => resolve()));
}

function backfill() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(async () => {
    // Best-effort: create org_users if not exists (dev only)
    await run(db, `CREATE TABLE IF NOT EXISTS org_users(tenant_id TEXT, user_email TEXT, role TEXT, PRIMARY KEY(tenant_id, user_email))`);

    for (const t of tables) {
      // Add tenant_id column if missing
      await run(db, `ALTER TABLE ${t.name} ADD COLUMN tenant_id TEXT`, []).catch(()=>{});
      // 1) Set via join on org_users if email column exists
      if (t.emailCol) {
        await run(db, `UPDATE ${t.name} SET tenant_id = (
           SELECT tenant_id FROM org_users ou WHERE ou.user_email = ${t.name}.${t.emailCol} LIMIT 1
        ) WHERE tenant_id IS NULL OR tenant_id = ''`).catch(()=>{});
      }
      // 2) Default remaining to DEFAULT_TENANT
      await run(db, `UPDATE ${t.name} SET tenant_id = ? WHERE tenant_id IS NULL OR tenant_id = ''`, [DEFAULT_TENANT]).catch(()=>{});
    }
    db.close();
    console.log('Backfill tenant_id completed.');
  });
}

backfill();
