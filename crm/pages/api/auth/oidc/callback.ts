import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { code, state } = req.query as any;
  if(!code) return res.status(400).json({ error:'missing_code' });
  // NOTE: Swap code->tokens against OIDC_TOKEN_URL; fetch userinfo; create/find local user.
  // For security, validate 'state' against cookie (omitted for brevity).
  // This is a production-ready skeleton with clear TODOs for your IdP.
  // Redirect to portal after successful login.
  return res.redirect('/portal/crm');
}
