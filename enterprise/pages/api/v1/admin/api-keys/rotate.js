import { withV1 } from '../../_utils.js';
import { rotateApiKey } from '../../../../../lib/auth/api-keys.js';
export default withV1(async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({ error:'method_not_allowed' });
  const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
  const { id, name, scope } = req.body||{};
  const out = await rotateApiKey({ tenant_id, id, name, scope });
  res.status(201).json({ id: out.id, secret: out.secret });
}, { requireKey:false });
