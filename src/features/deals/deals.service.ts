// src/features/deals/deals.service.ts
import { dealsRepo, Deal } from './deals.repo';
export async function listDeals(){ return dealsRepo.all(); }
export async function upsertDeal(d: Deal){ d.ts = d.ts ?? Date.now(); return dealsRepo.upsert(d); }
export async function removeDeal(id:string){ return dealsRepo.remove(id); }
