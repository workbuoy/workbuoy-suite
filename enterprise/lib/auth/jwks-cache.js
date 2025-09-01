
import jwksClient from 'jwks-rsa';
const caches = new Map();
export function getJwks(issuer){
  if(!caches.has(issuer)){
    caches.set(issuer, jwksClient({ jwksUri: issuer.replace(/\/$/,'') + '/.well-known/jwks.json', cache: true, cacheMaxEntries: 5, cacheMaxAge: 10*60*1000 }));
  }
  return caches.get(issuer);
}
