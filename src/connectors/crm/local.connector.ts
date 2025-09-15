// src/connectors/crm/local.connector.ts
import type { CrmConnector, Contact } from './connector.interface';
import { FileRepo } from '../../core/persist/fileRepo';

export class LocalCrmConnector implements CrmConnector {
  private repo = new FileRepo<Contact>('crm.contacts.json');
  async listContacts() { return await this.repo.all(); }
  async upsertContact(c: Contact) { await this.repo.upsert(c); return c; }
}
