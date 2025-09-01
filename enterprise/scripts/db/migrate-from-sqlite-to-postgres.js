
// scripts/db/migrate-from-sqlite-to-postgres.js
// Usage: node scripts/db/migrate-from-sqlite-to-postgres.js
const { Client } = require('pg');
const sqlite = require('../../lib/db/sqlite');
const fs = require('fs');
const path = require('path');

async function main(){
  if(!process.env.DATABASE_URL){
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL==='true' ? { rejectUnauthorized: false } : false
  });
  await client.connect();

  // Apply PG migrations
  const migDir = path.join(process.cwd(), 'db','pg','migrations');
  const files = fs.readdirSync(migDir).filter(f => f.endsWith('.sql')).sort();
  for(const f of files){
    console.log('Applying PG migration', f);
    await client.query(fs.readFileSync(path.join(migDir,f),'utf8'));
    await client.query('INSERT INTO _migrations(name) VALUES($1) ON CONFLICT DO NOTHING',[f]);
  }

  // Tables to copy
  const tables = ['users','purchases','audit_logs'];
  for(const t of tables){
    console.log('Migrating table', t);
    const rows = sqlite.query(`SELECT * FROM ${t}`).rows;
    if(rows.length === 0) continue;
    const cols = Object.keys(rows[0]);
    const placeholders = cols.map((_,i)=>`$${i+1}`).join(',');
    const text = `INSERT INTO ${t} (${cols.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
    for(const r of rows){
      const values = cols.map(c => r[c]);
      await client.query(text, values);
    }
    // Count compare
    const { rows: [{count}] } = await client.query(`SELECT COUNT(*)::int as count FROM ${t}`);
    if(count !== rows.length){
      console.warn(`Row count mismatch for ${t}: sqlite=${rows.length} pg=${count}`);
    } else {
      console.log(`OK: ${t} rows match (${count})`);
    }
  }

  await client.end();
  console.log('Migration complete.');
}
main().catch(e=>{ console.error(e); process.exit(1); });
