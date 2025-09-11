import type { Contact } from "./contacts.types";
const items: Contact[] = [];

export function list(q?: string, limit=50, offset=0): Contact[] {
  const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q.toLowerCase())) : items;
  return filtered.slice(offset, offset+limit);
}
export function create(data: { name: string; email?: string; phone?: string }): Contact {
  const c: Contact = { id: Math.random().toString(36).slice(2), createdAt: new Date().toISOString(), ...data };
  items.unshift(c);
  return c;
}
export function remove(id: string): boolean {
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) { items.splice(idx,1); return true; }
  return false;
}
