import fs from 'fs';
import path from 'path';

export default async function handler(req,res){
  try{
    const tenant = req.headers['x-tenant-id'] || 'default';
    const storePath = path.join(process.cwd(),'data','tenant_settings.json');
    let data = {};
    try { data = JSON.parse(fs.readFileSync(storePath,'utf-8')); } catch(e){}
    const entry = data[tenant] || { wb2wb_enabled: true, policy: {
      MUST_HAVE:['order_status','delivery_update','capacity_confirm','critical_alert'],
      NICE_TO_SHARE:['forecast','aggregated_volume','quality_report'],
      NEVER:['prices','margins','other_customers','contracts']
    }};
    res.status(200).json({ ok:true, tenant, settings:{ wb2wb_enabled: !!entry.wb2wb_enabled }, policy: entry.policy });
  }catch(e){
    res.status(500).json({ ok:false, error:'policy_get_failed' });
  }
}
