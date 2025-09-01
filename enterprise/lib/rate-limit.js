
// lib/rate-limit.js
const buckets = new Map();

export function rateLimit(req, res, { key='global', windowMs=60000, max=60 }){
  const now = Date.now();
  const id = key + ':' + (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anon');
  const b = buckets.get(id) || { reset: now + windowMs, count: 0 };
  if(now > b.reset){ b.reset = now + windowMs; b.count = 0; }
  b.count += 1;
  buckets.set(id, b);
  if(b.count > max){
    try{ require('./metrics').increment('wb_auth_abuse_block_total'); }catch(_){}
    res.status(429).json({ error: 'Too many requests' });
    return false;
  }
  return true;
}
