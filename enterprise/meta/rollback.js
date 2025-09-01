import fs from 'fs';
import path from 'path';
import { auditLog } from '../../../lib/audit.js';
export default function handler(req,res){
  const target = path.join(process.cwd(),'config');
  const snap = path.join(target,'PROPOSED.patch.json');
  if(fs.existsSync(snap)) fs.unlinkSync(snap);
  auditLog({ action:'meta:rollback', details:{} });
  res.json({ ok:true, rolledBack:true });
}
