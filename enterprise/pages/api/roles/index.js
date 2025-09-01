import fs from 'fs';
import path from 'path';
import { requireAuth } from '../../../lib/auth.js';
import { auditLog } from '../../../lib/audit.js';

const ROLES_PATH = path.join(process.cwd(), 'data','roles','roles.json');

export default function handler(req,res){
  const user = requireAuth(req,res);
  if(!user) return;
  if(req.method==='GET'){
    const raw = fs.readFileSync(ROLES_PATH,'utf8');
    let data = JSON.parse(raw); data = Array.from(new Map(data.map(r=>[r.role_id,r])).values());
    const { domain, q, limit=50 } = req.query;
    let out = data;
    if(domain) out = out.filter(r => (r.domains||[]).includes(domain));
    if(q){
      const s = String(q).toLowerCase();
      out = out.filter(r=> (r.canonical_title||'').toLowerCase().includes(s) || (r.summary||'').toLowerCase().includes(s));
    }
    auditLog({user_email:user.email, action:'roles_list', details:{count: out.length}});
    res.json({ roles: out.slice(0, Number(limit)) });
  } else {
    res.status(405).json({error:'method_not_allowed'});
  }
}
