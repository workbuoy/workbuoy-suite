// pages/api/meta/experiments/start.js
import { startExperiment } from '../../../../lib/meta/experiments.js';
import { assertAutonomyAllowed } from '../../../../lib/secure-policy.js';

import SLO from '../../../lib/meta/slo-watch.js';

export default async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try{
    assertAutonomyAllowed();
    const { name, goal, sla_target, variants, prometheus } = req.body || {};
    if(!name || !sla_target){
      return res.status(400).json({ error: 'name and sla_target are required' });
    }
    const actor = req.headers['x-user'] || 'api';
    const id = await startExperiment({ name, goal, sla_target, variants, prometheus, actor });
    return res.status(200).json({ ok:true, id });
  }catch(e){
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || 'Internal Error' });
  }
}
