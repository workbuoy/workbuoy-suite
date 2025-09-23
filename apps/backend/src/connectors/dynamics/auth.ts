import fetch from 'node-fetch';

export interface DynAuthConfig {
  tenantId: string;            // AAD tenant
  clientId: string;            // app registration
  clientSecret: string;        // client secret
  scope: string;               // e.g. https://org.crm.dynamics.com/.default
  tokenUrl?: string;           // override for tests
}

export async function getAccessToken(cfg: DynAuthConfig): Promise<string> {
  const tokenEndpoint = cfg.tokenUrl || `https://login.microsoftonline.com/${cfg.tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams();
  body.set('grant_type','client_credentials');
  body.set('client_id', cfg.clientId);
  body.set('client_secret', cfg.clientSecret);
  body.set('scope', cfg.scope);
  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) throw new Error('aad token failed: '+res.status);
  const data: any = await res.json();
  return data.access_token;
}
