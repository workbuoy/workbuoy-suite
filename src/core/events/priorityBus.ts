
import fs from 'fs';
import path from 'path';

type Priority = 'high'|'medium'|'low';
type Handler = (ev: { id:string; type:string; payload:any; ts:string }) => Promise<void>;

interface QItem { id:string; type:string; payload:any; ts:string; priority: Priority; tries: number; }

const DLQ_FILE = process.env.WB_DLQ_FILE || path.join(process.cwd(), 'dlq.jsonl');
const metrics = { published: 0, handled: 0, failed: 0, dlq: 0 };
const high: QItem[] = []; const med: QItem[] = []; const low: QItem[] = [];
const subs: Record<string, Handler[]> = {};

function nextItem(): QItem|undefined {
  if (high.length) return high.shift();
  if (med.length) return med.shift();
  if (low.length) return low.shift();
  return undefined;
}

export const PriorityBus = {
  publish(type: string, payload:any, opts?: { priority?: Priority; id?: string }) {
    const item: QItem = { id: (opts?.id) || (globalThis.crypto?.randomUUID?.() || String(Date.now())),
      type, payload, ts: new Date().toISOString(), priority: opts?.priority || 'low', tries: 0 };
    metrics.published++;
    (item.priority === 'high' ? high : item.priority === 'medium' ? med : low).push(item);
    setImmediate(processLoop);
    return item.id;
  },
  subscribe(type: string, handler: Handler){
    (subs[type] ||= []).push(handler);
  },
  stats(){ return { ...metrics, q:{ high: high.length, med: med.length, low: low.length } }; },
  dlqList(limit=200){
    try {
      const txt = fs.readFileSync(DLQ_FILE, 'utf8');
      return txt.trim().split('\n').filter(Boolean).slice(-limit).map(l => JSON.parse(l));
    } catch { return []; }
  }
};

async function processLoop(){
  let item: QItem|undefined;
  while ((item = nextItem())) {
    const handlers = subs[item.type] || [];
    if (!handlers.length) { metrics.failed++; persistDLQ(item, 'no_subscribers'); continue; }
    try {
      for (const h of handlers) { item.tries++; await h(item); }
      metrics.handled++;
    } catch (e:any) {
      if (item.tries >= 3) { metrics.failed++; persistDLQ(item, e?.message || 'handler_error'); }
      else {
        // backoff by demoting priority
        (item.priority === 'high' ? med : low).push(item);
      }
    }
  }
}

function persistDLQ(item: QItem, reason: string){
  metrics.dlq++;
  const rec = { ...item, reason, at: new Date().toISOString() };
  try { fs.appendFileSync(DLQ_FILE, JSON.stringify(rec) + '\n', 'utf8'); } catch {}
}
