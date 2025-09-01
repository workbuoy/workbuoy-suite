import { withRateLimit } from '../../lib/middleware/withRateLimit.js';
async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({ ok:false, error:'method_not_allowed' });
  const { email, provider, link } = req.body || {};
  if(!email || !provider || !link) return res.status(400).json({ ok:false, error:'missing_fields' });
  return res.status(200).json({ ok:true, note:'mailer wired in full repo' });
}

export default withRateLimit(handler);
