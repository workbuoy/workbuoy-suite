
// scripts/crypto/encrypt-backfill.js
// Encrypt configured PII fields for existing rows.
const db = require('../../lib/db');
const { maybeEncrypt } = require('../../lib/db/middleware');
const fs = require('fs');

async function run(){
  const map = require('../../public/config/pii.fields.json');
  for(const [table, cols] of Object.entries(map.tables)){
    if(cols.length === 0) continue;
    console.log('Backfilling table', table);
    const rows = (await db.query(`SELECT * FROM ${table}`)).rows;
    for(const r of rows){
      const enc = await maybeEncrypt(table, r);
      // build update
      const sets = cols.map((c,i)=>`${c}=$${i+1}`).join(',');
      const values = cols.map(c => enc[c]);
      if(values.length > 0){
        await db.query(`UPDATE ${table} SET ${sets} WHERE id=$${values.length+1}`, [...values, r.id]);
      }
    }
  }
  console.log('Backfill complete');
}
run().catch(e=>{ console.error(e); process.exit(1); });
