import { randomUUID } from 'crypto';
import { selectRepo } from '../../core/persist/select';

export interface LogEntry { id:string; level:'info'|'warn'|'error'|'debug'; message:string; correlationId?:string; ts:string }
export interface LogRepository {
  list(limit?:number): Promise<LogEntry[]>;
  append(e: Omit<LogEntry,'id'|'ts'>): Promise<LogEntry>;
}
const repo = selectRepo<LogEntry>('logs');
export const LogRepo: LogRepository = {
  async list(limit=100){
    const rows = await repo.all();
    const slice = rows.sort((a,b)=>a.ts.localeCompare(b.ts));
    return slice.slice(-limit);
  },
  async append(e){
    const row: LogEntry = { id: randomUUID(), ts: new Date().toISOString(), ...e };
    await repo.upsert(row);
    return row;
  }
};
