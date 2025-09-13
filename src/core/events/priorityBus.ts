type Priority = 'high'|'medium'|'low';
type Handler = (e: any) => void|Promise<void>;
type QueueItem = { type:string; priority:Priority; payload?:any };

const subs = new Map<string, Handler[]>();
const q: Record<Priority, QueueItem[]> = { high:[], medium:[], low:[] };
const dlq: QueueItem[] = [];
const MAX_ATTEMPTS = Number(process.env.BUS_MAX_ATTEMPTS || 3);

function subscribe(type: string, handler: Handler){
  const arr = subs.get(type) || [];
  arr.push(handler);
  subs.set(type, arr);
}

function emit(e: Partial<QueueItem> & { type:string; priority?:Priority }){
  const item: QueueItem = { priority: e.priority || 'low', type: e.type, payload: (e as any).payload };
  q[item.priority].push(item);
  setImmediate(drain);
}

async function drain(){
  for (const p of ['high','medium','low'] as Priority[]){
    while(q[p].length){
      const item = q[p].shift()!;
      const handlers = subs.get(item.type) || [];
      for (const h of handlers){
        let attempts = 0, ok=false;
        while(attempts < MAX_ATTEMPTS && !ok){
          attempts++;
          try{
            await Promise.resolve(h(item));
            ok = true;
          }catch(_e){
            if (attempts>=MAX_ATTEMPTS){
              dlq.push(item);
            }
          }
        }
      }
    }
  }
}

function _peek(){
  return { sizes: { high: q.high.length, medium: q.medium.length, low: q.low.length, dlq: dlq.length } };
}

export default { subscribe, emit, _peek };
