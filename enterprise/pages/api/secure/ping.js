import { requireAuth } from '../../../lib/auth.js';
import { auditLog } from '../../../lib/audit.js';

export default function handler(req,res){
  const user = requireAuth(req,res);
  if(!user) return;
  auditLog({user_email:user.email, action:'secure_ping', details:{ip:req.headers['x-forwarded-for']||req.socket.remoteAddress}});
  res.json({ ok: true, who: user.email });
}
