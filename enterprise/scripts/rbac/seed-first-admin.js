
/* Seed: first user per tenant becomes admin */
const path = require('path');
const sqlite3 = require('sqlite3');
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS user_roles(tenant_id TEXT, user_id TEXT, role TEXT, PRIMARY KEY(tenant_id,user_id))`);
  // naive seed: ensure at least one admin per tenant found in org_users if exists
  db.all(`SELECT DISTINCT tenant_id FROM org_users`, (e, tenants)=>{
    if(e || !tenants) return process.exit(0);
    tenants.forEach(t=>{
      db.get(`SELECT 1 FROM user_roles WHERE tenant_id=? AND role='admin'`, [t.tenant_id], (e2, row)=>{
        if(row) return;
        db.get(`SELECT user_id FROM org_users WHERE tenant_id=? LIMIT 1`, [t.tenant_id], (e3, u)=>{
          if(!u) return;
          db.run(`INSERT OR IGNORE INTO user_roles(tenant_id,user_id,role) VALUES(?,?,?)`, [t.tenant_id, u.user_id, 'admin']);
        });
      });
    });
  });
});
