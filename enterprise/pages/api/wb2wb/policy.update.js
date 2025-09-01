import fs from 'fs';
import path from 'path';

export default async function handler(req,res){
  try{
    if(req.method !== 'POST') return res.status(405).json({ ok:false, error:'method_not_allowed' });
    const tenant = req.headers['x-tenant-id'] || 'default';
    const { wb2wb_enabled, policy } = req.body || {};
    const storePath = path.join(process.cwd(),'data','tenant_settings.json');
    let data = {};
    try { data = JSON.parse(fs.readFileSync(storePath,'utf-8')); } catch(e){}
    data[tenant] = {
      wb2wb_enabled: typeof wb2wb_enabled === 'boolean' ? wb2wb_enabled : (data[tenant]?.wb2wb_enabled ?? true),
      policy: policy || data[tenant]?.policy || {
        MUST_HAVE:['order_status','delivery_update','capacity_confirm','critical_alert'],
        NICE_TO_SHARE:['forecast','aggregated_volume','quality_report'],
        NEVER:['prices','margins','other_customers','contracts']
      }
    };
    fs.writeFileSync(storePath, JSON.stringify(data,null,2));
    res.status(200).json({ ok:true, saved:true, tenant });
  }catch(e){
    res.status(400).json({ ok:false, error:'policy_update_failed' });
  }
}
