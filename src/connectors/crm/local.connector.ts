import { CrmConnector } from './base';
import { FileRepo } from '../../core/persist/fileRepo';
export class LocalCrmConnector implements CrmConnector {
  private repo = new FileRepo<any>('crm_contacts.json');
  async listContacts(){ return this.repo.all(); }
  async upsertContact(c:any){ return this.repo.upsert(c); }
  async removeContact(id:string){ return this.repo.remove(id); }
}
