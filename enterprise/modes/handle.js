import { requireAuth } from '../../../lib/auth.js';
import { handleMode, Proactivity } from '../../../lib/modes.js';

export default function handler(req,res){
  const user = requireAuth(req,res);
  if(!user) return;
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { mode, input, context } = req.body || {};
  if(!mode || !Object.values(Proactivity).includes(mode)) return res.status(400).json({error:'bad_mode'});
  const result = handleMode({mode, input, context, user});
  res.json(result);
}
