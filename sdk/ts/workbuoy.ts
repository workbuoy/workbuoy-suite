export class WorkBuoyClient {
  base: string;
  headers: Record<string,string>;
  constructor(params: { base: string, apiKey: string, tenantId: string }) {
    this.base = params.base.replace(/\/$/,''); 
    this.headers = { 'x-api-key': params.apiKey, 'x-tenant-id': params.tenantId, 'Content-Type':'application/json' };
  }
  async listContacts(limit=50){ const r=await fetch(`${this.base}/api/v1/crm/contacts?limit=${limit}`,{headers:this.headers}); return r.json(); }
  async createContact(body:any){ const r=await fetch(`${this.base}/api/v1/crm/contacts`,{method:'POST',headers:this.headers,body:JSON.stringify(body)}); return r.json(); }
  async patchContact(id:string, body:any){ const r=await fetch(`${this.base}/api/v1/crm/contacts/${id}`,{method:'PATCH',headers:this.headers,body:JSON.stringify(body)}); return r.json(); }
  async listOpportunities(limit=50){ const r=await fetch(`${this.base}/api/v1/crm/opportunities?limit=${limit}`,{headers:this.headers}); return r.json(); }
  async createOpportunity(body:any){ const r=await fetch(`${this.base}/api/v1/crm/opportunities`,{method:'POST',headers:this.headers,body:JSON.stringify(body)}); return r.json(); }
  async patchOpportunity(id:string, body:any){ const r=await fetch(`${this.base}/api/v1/crm/opportunities/${id}`,{method:'PATCH',headers:this.headers,body:JSON.stringify(body)}); return r.json(); }
  async batchImport(entity:'contacts'|'opportunities', file:Blob, dry=false){
    const form = new FormData();
    form.append('entity', entity); form.append('dry_run', String(dry)); form.append('file', file);
    const r=await fetch(`${this.base}/api/v1/crm/import`,{method:'POST',headers:{'x-api-key':this.headers['x-api-key'],'x-tenant-id':this.headers['x-tenant-id']},body:form as any}); return r.json();
  }
  async export(entity:'contacts'|'opportunities', format:'csv'|'json'='json'){
    const r=await fetch(`${this.base}/api/v1/crm/export?entity=${entity}&format=${format}`,{headers:this.headers}); return r.text();
  }
}
