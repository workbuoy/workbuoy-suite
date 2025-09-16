import { selectRepo } from '../../core/persist/select';
export type Contact = { id:string; name:string; email:string };
const repo = selectRepo<Contact>('crm_contacts');

export async function listContacts(){ return repo.all(); }
export async function upsertContact(c:Contact){ return repo.upsert(c); }
export async function removeContact(id:string){ return repo.remove(id); }
