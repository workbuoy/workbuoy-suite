import { Contact } from './contacts.types';

const store: Map<string, Contact> = new Map();

function id(){ return Math.random().toString(36).slice(2,10); }

export function list(): Contact[]{ return Array.from(store.values()); }
export function create(c: Omit<Contact,'id'|'createdAt'>): Contact{
  const item: Contact = { ...c, id: id(), createdAt: new Date().toISOString() };
  store.set(item.id, item);
  return item;
}
export function remove(id: string){ return store.delete(id); }
export function clear(){ store.clear(); }
