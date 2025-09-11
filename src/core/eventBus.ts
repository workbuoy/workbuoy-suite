export type Priority = "low" | "normal" | "high";
export interface Event<T = any> { type: string; payload: T; priority?: Priority; }

type Handler = (evt: Event) => Promise<void> | void;

const handlers: Record<string, Handler[]> = {};
export const DLQ: Event[] = [];

export function on(type: string, handler: Handler) {
  handlers[type] = handlers[type] || [];
  handlers[type].push(handler);
}

export async function emit(evt: Event) {
  const hs = handlers[evt.type] || [];
  const sorted = [...hs]; // placeholder for priority-based routing
  for (const h of sorted) {
    try {
      await h(evt);
    } catch (_e) {
      DLQ.push(evt);
    }
  }
}
