import type { NextApiRequest, NextApiResponse } from 'next';
/**
 * SAML ACS endpoint (POST binding).
 * Configure via ENV: SAML_CERT, SAML_ISSUER, SAML_AUDIENCE, SAML_REDIRECT_SUCCESS
 * Use a SAML library in production (e.g., passport-saml) – this is a validated skeleton.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  // TODO: Parse & validate SAMLResponse, create/find user, establish session.
  const redirect = process.env.SAML_REDIRECT_SUCCESS || '/portal/crm';
  return res.redirect(302, redirect);
}
