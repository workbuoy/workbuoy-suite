export type Priority = 'high'|'medium'|'low';

export interface WorkbuoyEvent<T=any> {
  id: string; type: string; priority: Priority;
  timestamp: string; correlationId?: string; payload: T; retries?: number;
}

type Handler = (e: WorkbuoyEvent)=>Promise<void>;

const handlers = new Map<string, Handler[]>();
const processed = new Set<string>();
const dlq: WorkbuoyEvent[] = [];

const queues: Record<Priority, WorkbuoyEvent[]> = { high:[], medium:[], low:[] };
const MAX_RETRIES = 3;

export const EventBus = {
  subscribe(type: string, handler: Handler) {
    const list = handlers.get(type) ?? [];
    list.push(handler);
    handlers.set(type, list);
  },

  async publish<T>(event: WorkbuoyEvent<T>) {
    if (processed.has(event.id)) return; // idempotent
    queues[event.priority].push({ ...event, retries: event.retries ?? 0 });
    await drain();
  },

  // testing/introspection
  __dlq() { return dlq.slice(); },
  __reset() {
    handlers.clear(); processed.clear(); dlq.splice(0, dlq.length);
    queues.high.length = queues.medium.length = queues.low.length = 0;
  }
};

async function drain() {
  for (const p of (['high','medium','low'] as Priority[])) {
    while (queues[p].length) {
      const ev = queues[p].shift()!;
      const list = handlers.get(ev.type) ?? [];
      if (!list.length) { processed.add(ev.id); continue; }

      try {
        for (const h of list) await h(ev);
        processed.add(ev.id);
      } catch (_e) {
        ev.retries = (ev.retries ?? 0) + 1;
        if (ev.retries >= MAX_RETRIES) dlq.push(ev);
        else queues[p].push(ev);
      }
    }
  }
}
