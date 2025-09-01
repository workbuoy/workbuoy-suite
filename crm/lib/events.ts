import { EventEmitter } from 'events';
// @ts-ignore - use a global singleton during SSR
const g: any = globalThis as any;
if (!g.__WB_EVENTS__) g.__WB_EVENTS__ = new EventEmitter();
export const bus: EventEmitter = g.__WB_EVENTS__;
