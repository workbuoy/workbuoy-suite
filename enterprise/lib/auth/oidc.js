'use strict';
/**
 * OIDC/JWKS token verification using standard JWS with RS256.
 * Exposes verifyAccessToken(req) -> user|throws and withAuth(handler, roles?). 
 */
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const { enforceRBAC } = require('../rbac');

const issuer = process.env.OIDC_ISSUER;
const audience = process.env.OIDC_AUDIENCE;
const client = jwksClient({
  jwksUri: `${issuer}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header, cb){
  client.getSigningKey(header.kid, function(err, key){
    if (err) return cb(err);
    const signingKey = key.getPublicKey();
    cb(null, signingKey);
  });
}

async function verifyAccessToken(req){
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('missing_bearer');
  return new Promise((resolve, reject)=>{
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      audience,
      issuer,
      clockTolerance: 5
    }, (err, decoded)=>{
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

function withAuth(handler, { roles = [] } = {}){
  return async (req, res) => {
    try {
      const user = await verifyAccessToken(req);
      req.user = { id: user.sub, roles: user['roles'] || user['permissions'] || [] , tenant: user['tenant'] || user['org_id'] };
      // Enforce RBAC by required roles; tenant header is ignored in prod
      if (roles.length) enforceRBAC(req.user, roles);
      // Normalize tenant: disallow override from headers when NODE_ENV=production
      if (process.env.NODE_ENV === 'production') {
        req.tenantId = req.user.tenant;
      } else {
        req.tenantId = req.headers['x-tenant-id'] || req.user.tenant;
      }
      return handler(req, res);
    } catch (e){
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'unauthorized' }));
    }
  };
}

module.exports = { verifyAccessToken, withAuth };
