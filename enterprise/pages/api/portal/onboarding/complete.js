
import { wbOnboardingCompleted } from '../../../../lib/metrics/registry.js';
export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  try{ wbOnboardingCompleted.inc(); }catch(_){}
  res.json({ok:true});
}
