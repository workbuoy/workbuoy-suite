const buckets=new Map(); const CAP=60, REFILL_PER_SEC=1;
export function withRateLimit(handler){
  return async (req,res)=>{
    const id = req.headers['x-user-id'] || req.headers['x-tenant-id'] || req.socket.remoteAddress || 'anon';
    const now=Date.now(); const b=buckets.get(id)||{tokens:CAP,ts:now}; const elapsed=(now-b.ts)/1000;
    b.tokens=Math.min(CAP, b.tokens + elapsed*REFILL_PER_SEC);
    if(b.tokens<1){ const retry=Math.ceil((1-b.tokens)/REFILL_PER_SEC); res.setHeader('Retry-After', String(retry)); return res.status(429).json({ok:false,error:'rate_limited',retryAfter:retry});}
    b.tokens-=1; b.ts=now; buckets.set(id,b); return handler(req,res);
  };
}
