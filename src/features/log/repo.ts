export interface LogEntry { id:string; level:'info'|'warn'|'error'|'debug'; message:string; correlationId?:string; ts:string }
export interface LogRepository {
  list(limit?:number): Promise<LogEntry[]>;
  append(e: Omit<LogEntry,'id'|'ts'>): Promise<LogEntry>;
}
const data: LogEntry[] = [];
export const InMemoryLogRepo: LogRepository = {
  async list(limit=100){ return data.slice(-limit); },
  async append(e){ const row = { id: (globalThis.crypto?.randomUUID?.() || String(Date.now())), ts: new Date().toISOString(), ...e }; data.push(row); return row; }
};
