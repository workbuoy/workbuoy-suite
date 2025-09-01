// pages/api/meta/experiments/[id]/metrics.js
import { summarizeMetrics, getExperiment } from '../../../../../lib/meta/experiments.js';

export default async function handler(req, res){
  const { id } = req.query;
  if(req.method !== 'GET'){
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try{
    const exp = await getExperiment(id);
    if(!exp){ return res.status(404).json({ error: 'Experiment not found' }); }
    const summary = await summarizeMetrics(id);
    return res.status(200).json(summary);
  }catch(e){
    return res.status(500).json({ error: e.message || 'Internal Error' });
  }
}
