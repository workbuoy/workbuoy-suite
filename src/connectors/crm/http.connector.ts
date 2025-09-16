import { CrmConnector } from './base';
export class HttpCrmConnector implements CrmConnector {
  private base: string;
  constructor(baseUrl:string){ this.base=baseUrl; }
  async listContacts(){ return fetch(this.base+'/contacts').then(r=>r.json()); }
  async upsertContact(c:any){ return fetch(this.base+'/contacts',{method:'POST',body:JSON.stringify(c)}).then(r=>r.json()); }
  async removeContact(id:string){ await fetch(this.base+'/contacts/'+id,{method:'DELETE'}); return true; }
}
