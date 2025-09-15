// src/core/eventBusV2.ts
export interface PriorityBus {
  emit<T>(type: string, payload: T, opts?: {priority?: 'high'|'med'|'low', idempotencyKey?: string}): Promise<void>;
  on(type: string, handler: (payload:any)=>Promise<void>): void;
  stats(): Promise<{queues:any[], dlq:any[]}>>;
}

let priorityBus: any; let dlq: any;
try { priorityBus = require('./priorityBus'); } catch {}
try { dlq = require('./dlq'); } catch {}

async function stats() {
  const queues = (priorityBus?.snapshot && await priorityBus.snapshot()) || [];
  const dead = (dlq?.snapshot && await dlq.snapshot()) || [];
  return { queues, dlq: dead };
}

export const bus: PriorityBus = {
  emit: (type: string, payload: any, opts?: any) => priorityBus?.emit ? priorityBus.emit(type, payload, opts) : Promise.resolve(),
  on: (type: string, handler: (payload:any)=>Promise<void>) => { if (priorityBus?.on) priorityBus.on(type, handler); },
  stats
};
export default bus;
