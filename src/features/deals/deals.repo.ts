// src/features/deals/deals.repo.ts
import { FileRepo } from '../../core/persist/fileRepo';
export type Deal = { id:string; contactId:string; value:number; status:'open'|'won'|'lost'; ts?:number };
export const dealsRepo = new FileRepo<Deal>('deals.json');
