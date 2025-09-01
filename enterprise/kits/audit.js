import { auditLog } from '../../../lib/audit.js';
import { entitlementGrant } from '../../../lib/kits/index.js';

export default async function handler(req, res){
  const { sku, event='purchase' } = req.body || {};
  try{
    if(!sku) return res.status(400).json({ ok:false, error:'missing sku'});
    auditLog({ level:'info', action:`kit:${event}`, sku, user:req.headers['x-user']||'demo' });
    if(event==='purchase'){ entitlementGrant(req, sku); }
    return res.json({ ok:true });
  }catch(e){
    auditLog({ level:'error', action:'kit:audit', error:e.message });
    return res.status(500).json({ ok:false, error:e.message });
  }
}