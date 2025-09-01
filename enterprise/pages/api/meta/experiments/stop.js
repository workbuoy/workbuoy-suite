// pages/api/meta/experiments/stop.js
import { stopExperiment } from '../../../../lib/meta/experiments.js';
import { assertAutonomyAllowed } from '../../../../lib/secure-policy.js';

export default async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try{
    assertAutonomyAllowed();
    const { id, prometheus } = req.body || {};
    if(!id){ return res.status(400).json({ error: 'id is required' }); }
    const actor = req.headers['x-user'] || 'api';
    const result = await stopExperiment({ id, actor, prometheus });
    return res.status(200).json({ ok:true, ...result });
  }catch(e){
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || 'Internal Error' });
  }
}
