import { Repository } from '../types';

type Contact = { id: string; name: string; email: string };

export class ContactsMemoryRepo implements Repository<Contact> {
  private items: Contact[] = [];
  async create(data: Contact) { this.items.push(data); return data; }
  async update(id: string, patch: Partial<Contact>) {
    const idx = this.items.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('not found');
    this.items[idx] = { ...this.items[idx], ...patch };
    return this.items[idx];
  }
  async findById(id: string) { return this.items.find(c => c.id === id) || null; }
  async find({limit=50, offset=0, q}: any = {}) {
    return this.items.filter(c => !q || c.name.includes(q) || c.email.includes(q))
      .slice(offset, offset+limit);
  }
  async delete(id: string) { this.items = this.items.filter(c => c.id !== id); }
}
