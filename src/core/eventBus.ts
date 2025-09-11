export type Priority = "low" | "normal" | "high";

export interface Event<T = any> {
  type: string;
  payload: T;
  priority?: Priority;
}

type Handler = (evt: Event) => Promise<void> | void;

const handlers: Record<string, Handler[]> = {};

/** Simple in-proc DLQ for failed handlers (MVP) */
export const DLQ: Event[] = [];

/** Subscribe a handler for a given event type */
export function on(type: string, handler: Handler) {
  handlers[type] = handlers[type] || [];
  handlers[type].push(handler);
}

/** Emit an event to all subscribed handlers. Failures go to DLQ. */
const priorityOrder: Priority[] = ["high","normal","low"];

export async function emit(evt: Event) {
  const hs = handlers[evt.type] || [];
  // kjør handlers to ganger ved feil (1 retry)
  for (const h of hs.sort((a,b)=>0)) { // (MVP) behold registreringsrekkefølge
    try {
      await h(evt);
    } catch {
      try {
        await h(evt); // one retry
      } catch {
        DLQ.push(evt);
      }
    }
  }
}
