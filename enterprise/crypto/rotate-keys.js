
// scripts/crypto/rotate-keys.js
// Re-wrap CEKs with a new KMS key (no data re-encrypt).
const db = require('../../lib/db');
const { unwrap, wrap } = require('../../lib/crypto/kms');

async function run(){
  const newKid = process.env.NEW_KMS_KEY_ID;
  if(!newKid){ console.error('Set NEW_KMS_KEY_ID'); process.exit(1); }
  const map = require('../../public/config/pii.fields.json');
  for(const [table, cols] of Object.entries(map.tables)){
    if(cols.length === 0) continue;
    console.log('Rotating CEKs in', table);
    const rows = (await db.query(`SELECT id, ${cols.join(',')} FROM ${table}`)).rows;
    for(const r of rows){
      const updates = {};
      for(const c of cols){
        if(!r[c]) continue;
        const obj = typeof r[c] === 'string' ? JSON.parse(r[c]) : r[c];
        const dek = await unwrap(obj.kid, Buffer.from(obj.cek,'base64'));
        const cek = await wrap(newKid, dek);
        obj.kid = newKid;
        obj.cek = cek.toString('base64');
        updates[c] = JSON.stringify(obj);
      }
      const setCols = Object.keys(updates);
      if(setCols.length){
        const sets = setCols.map((c,i)=>`${c}=$${i+1}`).join(',');
        const values = setCols.map(c=>updates[c]);
        await db.query(`UPDATE ${table} SET ${sets} WHERE id=$${setCols.length+1}`, [...values, r.id]);
      }
    }
  }
  console.log('Rotation complete');
}
run().catch(e=>{ console.error(e); process.exit(1); });
