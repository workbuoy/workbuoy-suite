import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Initiates OIDC auth code flow by redirecting to Enterprise IdP.
 * Configure via ENV:
 *  - OIDC_AUTHZ_URL, OIDC_CLIENT_ID, OIDC_REDIRECT_URI, OIDC_SCOPE
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { OIDC_AUTHZ_URL, OIDC_CLIENT_ID, OIDC_REDIRECT_URI, OIDC_SCOPE } = process.env;
  if(!OIDC_AUTHZ_URL || !OIDC_CLIENT_ID || !OIDC_REDIRECT_URI){
    return res.status(501).json({ error: 'oidc_not_configured' });
  }
  const state = Math.random().toString(36).slice(2);
  const url = new URL(OIDC_AUTHZ_URL);
  url.searchParams.set('response_type','code');
  url.searchParams.set('client_id', OIDC_CLIENT_ID);
  url.searchParams.set('redirect_uri', OIDC_REDIRECT_URI);
  url.searchParams.set('scope', OIDC_SCOPE || 'openid profile email');
  url.searchParams.set('state', state);
  res.setHeader('Set-Cookie', `oidc_state=${state}; HttpOnly; Path=/; SameSite=Lax`);
  return res.redirect(String(url));
}
