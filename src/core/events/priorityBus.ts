/**
 * Priority Event Bus (in-memory) with simple retry & DLQ.
 */
export type Priority = "high" | "medium" | "low";
export type EventMsg = { type: string; priority?: Priority; payload?: any; attempts?: number; ts?: string };
type Handler = (e: EventMsg) => Promise<void> | void;

const queues: Record<Priority, EventMsg[]> = { high: [], medium: [], low: [] };
const handlers: Record<string, Handler[]> = {};
const dlq: EventMsg[] = [];
const MAX_ATTEMPTS = Number(process.env.BUS_MAX_ATTEMPTS || 3);

export const bus = {
  emit(e: EventMsg) {
    const p: Priority = e.priority || "low";
    e.ts = e.ts || new Date().toISOString();
    e.attempts = e.attempts || 0;
    queues[p].push(e);
    tick();
  },
  subscribe(type: string, fn: Handler) {
    handlers[type] = handlers[type] || [];
    handlers[type].push(fn);
  },
  _peek() {
    return { sizes: { high: queues.high.length, medium: queues.medium.length, low: queues.low.length, dlq: dlq.length }, dlq: dlq.slice(0, 25) };
  }
};

async function dispatchOne(e: EventMsg) {
  const list = handlers[e.type] || [];
  if (list.length === 0) return;
  try {
    for (const h of list) { await h(e); }
  } catch {
    e.attempts = (e.attempts || 0) + 1;
    if (e.attempts >= MAX_ATTEMPTS) dlq.push({ ...e });
    else queues[e.priority || "low"].push(e);
  }
}

let ticking = false;
async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const order: Priority[] = ["high","medium","low"];
    for (const p of order) {
      while (queues[p].length > 0) {
        const e = queues[p].shift()!;
        await dispatchOne(e);
      }
    }
  } finally {
    ticking = false;
    if (queues.high.length || queues.medium.length || queues.low.length) setTimeout(tick, 0);
  }
}

export default bus;
