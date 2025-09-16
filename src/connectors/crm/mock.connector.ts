import { CrmConnector } from './base';
export class MockCrmConnector implements CrmConnector {
  private items: any[] = [];
  async listContacts(){ return this.items; }
  async upsertContact(c:any){ this.items.push(c); return c; }
  async removeContact(id:string){ this.items = this.items.filter(x=>x.id!==id); return true; }
}
