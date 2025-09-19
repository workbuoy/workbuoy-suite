import { randomUUID } from 'crypto';
import { selectRepo } from '../../core/persist/select';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface CRMRepository {
  list(query?: { q?: string; limit?: number; offset?: number }): Promise<Contact[]>;
  create(input: Omit<Contact, 'id' | 'createdAt'> & { id?: string }): Promise<Contact>;
  remove(id: string): Promise<void>;
}

const repo = selectRepo<Contact>('crm_contacts');

function nextId(id?: string) {
  return id && id.trim().length ? id : randomUUID();
}

export const CRMRepo: CRMRepository = {
  async list() {
    return repo.all();
  },
  async create(input) {
    const row: Contact = {
      id: nextId((input as any).id),
      name: input.name,
      email: input.email,
      phone: input.phone,
      createdAt: new Date().toISOString()
    };
    await repo.upsert(row);
    return row;
  },
  async remove(id: string) {
    await repo.remove(id);
  }
};
