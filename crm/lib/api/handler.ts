import type { NextApiRequest, NextApiResponse } from 'next';
import type { ZodSchema } from 'zod';
import { validateOr400 } from '../validation/helpers';
import { requireWriteRole } from '../rbac';
import { apiLatency, httpRequestsTotal } from '../metrics';

type Handler = (req: NextApiRequest, res: NextApiResponse, parsed?: any) => Promise<any>;

export function apiHandler(route: string, schema?: ZodSchema<any>){
  return function(fn: Handler){
    return async function(req: NextApiRequest, res: NextApiResponse){
      const hist = apiLatency(); const cnt = httpRequestsTotal();
      const end = hist.startTimer(); let status = 200;
      try {
        const m = String(req.method || 'GET').toUpperCase();
        if (['POST','PUT','PATCH','DELETE'].includes(m)){
          if (!requireWriteRole(req, res)) { status = res.statusCode || 403; return; }
        }
        let parsed: any;
        if (schema && ['POST','PUT','PATCH'].includes(m)){
          const p = validateOr400(res, schema, req.body);
          if (!p) { status = 400; return; }
          parsed = p;
        }
        await fn(req, res, parsed);
      } catch (e:any){
        status = 500; res.status(500).json({ error:'internal_error', message: e?.message || 'unknown' });
      } finally {
        status = res.statusCode || status || 200;
        end({ route, method: String(req.method||'GET').toUpperCase(), status: String(status) });
        cnt.labels({ route, method: String(req.method||'GET').toUpperCase(), status: String(status) }).inc();
      }
    }
  }
}
