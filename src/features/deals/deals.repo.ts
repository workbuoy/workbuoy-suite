// src/features/deals/deals.repo.ts
import { randomUUID } from 'crypto';
import { selectRepo } from '../../core/persist/select';
export type Deal = { id:string; contactId:string; value:number; status:'open'|'won'|'lost'; ts?:number };
const repo = selectRepo<Deal>('deals');
export const dealsRepo = {
  async all(){ return repo.all(); },
  async upsert(row: Deal){
    const next: Deal = {
      id: row.id && row.id.trim().length ? row.id : randomUUID(),
      contactId: row.contactId,
      value: row.value,
      status: row.status,
      ts: row.ts ?? Date.now()
    };
    await repo.upsert(next);
    return next;
  },
  async remove(id: string){ await repo.remove(id); }
};
