import { withAuth } from '../../../lib/auth/oidc';
import { listMasked } from '../../../lib/secure/audit_view';
export default withAuth(async function handler(_req, res){
  const rows = await listMasked(200);
  res.json({ items: rows });
}, { roles: ['admin','auditor'] });
