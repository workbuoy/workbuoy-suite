export interface LogEntry { id:string; ts:string; level:'info'|'warn'|'error'|'debug'; message:string; correlationId?:string; }
const items: LogEntry[] = [];
function id(){ return Math.random().toString(36).slice(2,10); }
export function list(limit=50){ return items.slice(-limit); }
export function append(entry: Omit<LogEntry,'id'|'ts'>){ const obj = { ...entry, id:id(), ts:new Date().toISOString() }; items.push(obj); return obj; }
export function clear(){ items.length = 0; }
