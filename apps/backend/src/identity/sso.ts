import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, importSPKI, jwtVerify } from 'jose';
import { requireEnv, requireHeader } from '../utils/require.js';

const enabled = String(process.env.SSO_ENABLED ?? 'true').toLowerCase() === 'true';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
if (enabled) {
  const jwksUrl = process.env.OIDC_JWKS_URL;
  if (jwksUrl) {
    jwks = createRemoteJWKSet(new URL(jwksUrl));
  }
}

export async function ssoOptional(req: Request, _res: Response, next: NextFunction) {
  if (!enabled) return next();

  let authHeader: string;
  try {
    authHeader = requireHeader(req.headers as Record<string, unknown>, 'authorization');
  } catch {
    return next();
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : authHeader.trim();

  if (!token) {
    return next();
  }

  try {
    if (!jwks) {
      const publicKeyPem = requireEnv('SSO_JWT_PUBLIC_KEY');
      const key = await importSPKI(publicKeyPem, 'RS256');
      const { payload } = await jwtVerify(token, key, {
        algorithms: ['RS256'],
        issuer: process.env.OIDC_ISSUER,
        audience: process.env.OIDC_AUDIENCE,
      });
      (req as any).actor_user_id = String(payload.sub || payload.email || 'sso-user');
      (req as any).tenant_id = String(
        (payload as any).tenant || req.header(process.env.TENANT_HEADER || 'x-tenant-id') || 'sso-tenant',
      );
      (req as any).roles = Array.isArray((payload as any).roles) ? (payload as any).roles : ['viewer'];
      return next();
    }

    const { payload } = await jwtVerify(token, jwks, {
      algorithms: ['RS256'],
      issuer: process.env.OIDC_ISSUER,
      audience: process.env.OIDC_AUDIENCE,
    });
    (req as any).actor_user_id = String(payload.sub || payload.email || 'sso-user');
    (req as any).tenant_id = String(
      (payload as any).tenant || req.header(process.env.TENANT_HEADER || 'x-tenant-id') || 'sso-tenant',
    );
    (req as any).roles = Array.isArray((payload as any).roles) ? (payload as any).roles : ['viewer'];
  } catch {
    // ignore invalid token in optional mode
  }
  next();
}
