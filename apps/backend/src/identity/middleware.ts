import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const SSO_ENABLED = process.env.SSO_ENABLED === 'true';

const client = jwksClient({
  jwksUri: process.env.OIDC_JWKS_URI || 'https://example.com/.well-known/jwks.json',
  cache: true,
  rateLimit: true
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function identityMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!SSO_ENABLED) return next();
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'missing auth header' });
  const token = auth.replace('Bearer ', '');
  jwt.verify(token, getKey, {}, (err, decoded: any) => {
    if (err) return res.status(401).json({ error: 'invalid token' });
    (req as any).identity = {
      userId: decoded.sub,
      tenantId: decoded['tenant'] || decoded['tid'],
      roles: decoded['roles'] || []
    };
    next();
  });
}
