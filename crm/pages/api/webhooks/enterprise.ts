import crypto from 'crypto';
import { pipelineEventsTotal, syncErrorsTotal } from '../../../lib/metrics';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { bus } from '../../../lib/events';


export const config = { api: { bodyParser: false } } as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const chunks: Buffer[] = [];
  await new Promise<void>(resolve=>{ req.on('data', c=>chunks.push(Buffer.isBuffer(c)?c:Buffer.from(c))); req.on('end', ()=>resolve()); });
  const raw = Buffer.concat(chunks);
  let body: any = {};
  try { body = JSON.parse(raw.toString('utf8')||'{}'); } catch {}

  const secret = req.headers['x-enterprise-signature'] || '';
  if (process.env.ENTERPRISE_WEBHOOK_SECRET && secret !== process.env.ENTERPRISE_WEBHOOK_SECRET){
    syncErrorsTotal().labels({ source: 'enterprise' }).inc();
    return res.status(401).json({ error: 'invalid_signature' });
  }
const sig = String(req.headers['x-signature'] || '');
const ts = String(req.headers['x-timestamp'] || '');
if (process.env.ENTERPRISE_WEBHOOK_SECRET){
  const mac = crypto.createHmac('sha256', process.env.ENTERPRISE_WEBHOOK_SECRET).update(raw).digest('hex');
  const expected = `sha256=${mac}`;
  const fresh = (()=>{ const t = Number(ts||0); if(!t) return true; return Math.abs(Date.now() - t) < 5*60*1000; })();
  const safeEq = (a:string,b:string)=>{ try { return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)); } catch { return false; } };
  if (!fresh || !safeEq(expected, sig)) { syncErrorsTotal().labels({ source: 'enterprise' }).inc(); return res.status(401).json({ error: 'invalid_signature' }); }
}
  const { type, payload } = body || {};
  try {
    if (type === 'deal.stage.changed'){
      const { dealId, stage } = payload || {};
      const d = await prisma.deal.update({ where: { id: String(dealId) }, data: { stage } });
      pipelineEventsTotal().labels({ event: type, source: 'enterprise' }).inc();
      bus.emit('pipeline', { type, dealId, stage, ts: Date.now() });
      return res.json({ ok: true });
    }
    // Other events can be added here
    pipelineEventsTotal().labels({ event: type || 'unknown', source: 'enterprise' }).inc();
    bus.emit('pipeline', { type: type || 'unknown', ts: Date.now(), payload });
    return res.json({ ok: true });
  } catch (e:any){
    syncErrorsTotal().labels({ source: 'enterprise' }).inc();
    return res.status(500).json({ error: 'sync_failed', message: e?.message || 'unknown' });
  }
}
