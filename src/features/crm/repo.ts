
export interface Contact { id:string; name:string; email?:string; phone?:string; createdAt:string }
export interface CRMRepository {
  list(query?: { q?: string; limit?: number; offset?: number }): Promise<Contact[]>;
  create(input: Omit<Contact,'id'|'createdAt'>): Promise<Contact>;
  remove(id: string): Promise<void>;
}
const data: Contact[] = [];
export const InMemoryCRMRepo: CRMRepository = {
  async list(){ return data.slice(); },
  async create(i){ const row = { id: (globalThis.crypto?.randomUUID?.() || String(Date.now())), createdAt: new Date().toISOString(), ...i }; data.push(row); return row; },
  async remove(id){ const ix = data.findIndex(x=>x.id===id); if (ix>=0) data.splice(ix,1); }
};
