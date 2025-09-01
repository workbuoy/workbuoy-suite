import fs from 'fs';
import path from 'path';
import { auditLog } from '../../../lib/audit.js';
let SNAPSHOT=null;
export default function handler(req,res){
  const { id, patch } = req.body||{};
  // snapshot
  if(!SNAPSHOT){
    SNAPSHOT = { ts: Date.now(), files: {} };
    const target = path.join(process.cwd(),'config');
    if(fs.existsSync(target)){
      for(const f of fs.readdirSync(target)){ const p=path.join(target,f); if(fs.statSync(p).isFile()){ SNAPSHOT.files[f]=fs.readFileSync(p,'utf8'); } }
    }
  }
  // apply patch (write to /config/PROPOSED.patch.json for demo)
  const out = path.join(process.cwd(),'config','PROPOSED.patch.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ id, patch, applied_at: new Date().toISOString() }, null, 2));
  auditLog({ action:'meta:apply', details:{ id } });
  res.json({ ok:true, id, applied:true });
}
