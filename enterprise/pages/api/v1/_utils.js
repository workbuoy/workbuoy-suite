import { initTracing } from '../../../lib/otel/tracing.js';
import { verifyApiKey, logUsage } from '../../../lib/auth/api-keys.js';
import { allow } from '../../../lib/http/ratelimit.js';
import { checkIdempotency, storeIdempotency } from '../../../lib/http/idempotency.js';

export function withV1(handler, { requireKey=false }={}){
  return async (req, res)=>{ initTracing();{ res.setHeader('X-API-Version','1');
    const tenant_id = req.headers['x-tenant-id'] || 'demo-tenant';
    const apiKey = req.headers['x-api-key'] || null;
    let keyRow = null;
    if(requireKey){
      keyRow = await verifyApiKey(apiKey);
      if(!keyRow || keyRow.tenant_id!==tenant_id){
        res.status(401).json({ error:'unauthorized', message:'Ugyldig API-nøkkel' }); return;
      }
    }
    // rate limit
    const rl = allow({ tenant_id });
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    if(!rl.allowed){
      res.setHeader('Retry-After', '60');
      res.status(429).json({ error:'rate_limited' });
      if(keyRow) await logUsage(keyRow.id, req.url, 429);
      return;
    }
    // idempotency
    const idemKey = req.headers['idempotency-key'];
    if(['POST','PUT','PATCH'].includes(req.method)){
      const prev = await checkIdempotency(tenant_id, idemKey, req.method, req.url);
      if(prev){
        res.status(200).json({ ok:true, idempotent:true }); // simplified replay
        if(keyRow) await logUsage(keyRow.id, req.url, 200);
        return;
      }
    }
    // run handler
    const originalJson = res.json.bind(res);
    res.json = async (body)=>{
      if(['POST','PUT','PATCH'].includes(req.method) && idemKey){
        await storeIdempotency(tenant_id, idemKey, req.method, req.url, body);
      }
      if(keyRow) await logUsage(keyRow.id, req.url, res.statusCode||200);
      return originalJson(body);
    };
    return handler(req,res);
  };
}
