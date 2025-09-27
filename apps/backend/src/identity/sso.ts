import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const enabled = (process.env.SSO_ENABLED || 'true') === 'true';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
if (enabled && process.env.OIDC_JWKS_URL) {
  jwks = createRemoteJWKSet(new URL(process.env.OIDC_JWKS_URL));
}

export async function ssoOptional(req: Request, _res: Response, next: NextFunction) {
  if (!enabled) return next();
  const auth = req.header('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1];
  if (!token) return next();
  try {
    if (!jwks) return next();
    const { payload } = await jwtVerify(token, jwks, {
      issuer: process.env.OIDC_ISSUER,
      audience: process.env.OIDC_AUDIENCE,
    });
    (req as any).actor_user_id = String(payload.sub || payload.email || 'sso-user');
    (req as any).tenant_id = String((payload as any).tenant || req.header(process.env.TENANT_HEADER || 'x-tenant-id') || 'sso-tenant');
    (req as any).roles = Array.isArray((payload as any).roles) ? (payload as any).roles : ['viewer'];
  } catch {
    // ignore invalid token in optional mode
  }
  next();
}
