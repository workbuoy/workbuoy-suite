
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import sqlite3 from 'sqlite3';
import { auditVerifyChain } from '../../../lib/audit.js';

function bufferArchive(entries){
  return new Promise(async (resolve,reject)=>{
    const outChunks=[];
    const stream = new (require('stream').PassThrough)();
    stream.on('data',c=>outChunks.push(c));
    stream.on('end',()=>resolve(Buffer.concat(outChunks)));
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', reject);
    archive.pipe(stream);
    for(const e of entries){
      archive.append(JSON.stringify(e.data,null,2), { name: e.name });
    }
    archive.finalize();
  });
}

function fetchAll(db, sql, params=[]){
  return new Promise(res=>db.all(sql, params, (err,rows)=>res(rows||[])));
}

export default async function handler(req,res){
  const { action='gdpr_export' } = req.query||{};
  const dbPath = path.join(process.cwd(),'db','workbuoy.db');
  const db = new sqlite3.Database(dbPath);

  if(action==='gdpr_export'){
    const user = (req.headers['x-user']||'').toString();
    const email = user || (req.query.email||'').toString();
    const purchases = await fetchAll(db, `SELECT * FROM purchases WHERE user_email = ?`, [email]);
    const audit = await fetchAll(db, `SELECT * FROM audit_logs WHERE user_email = ?`, [email]);
    const signals = await fetchAll(db, `SELECT * FROM signals ORDER BY id DESC LIMIT 500`, []);
    const worm = await fetchAll(db, `SELECT id,ts,user_email,action,prev_hash,hash FROM audit_logs_worm WHERE user_email = ?`, [email]);
    const payload = [
      { name: 'profile.json', data: { email } },
      { name: 'purchases.json', data: purchases },
      { name: 'audit.json', data: audit },
      { name: 'signals.json', data: signals },
      { name: 'audit_worm.json', data: worm }
    ];
    const zipBuf = await bufferArchive(payload);
    res.setHeader('Content-Type','application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="gdpr_export_${email||'anon'}.zip"`);
    res.send(zipBuf);
    return;
  }

  if(action==='soc2_verify'){
    const result = await auditVerifyChain();
    return res.json({ ok: result.ok, ...result });
  }

  if(action==='hipaa_hooks'){
    // Simple toggleable safeguards footprint
    const safeguards = {
      administrative: ['risk_assessment','policies_training'],
      physical: ['workstation_security','device_controls'],
      technical: ['access_controls','audit_controls','integrity','transmission_security']
    };
    return res.json({ ok:true, enabled: true, safeguards });
  }

  res.status(400).json({ ok:false, error: 'unknown_action' });
}
