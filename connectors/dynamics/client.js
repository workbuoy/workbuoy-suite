import { adaptiveFetch } from './adaptive_fetch.js';

export class DynClient {
  constructor({ baseUrl, oauth, apiVersion='v9.2', metrics }){
    this.baseUrl = baseUrl.replace(/\/$/,''); // e.g. https://org.crm4.dynamics.com
    this.oauth = oauth;
    this.apiVersion = apiVersion;
    this.metrics = metrics || { inc: ()=>{} };
  }

  async upsert(entitySet, altKeyAttr, keyVal, fields){
    // Try PATCH to alternate key path: /api/data/v9.2/contacts(altKey='value')
    const tokenHeader = await this.oauth.authHeader();
    const encodedKey = encodeURIComponent(altKeyAttr) + "='" + encodeURIComponent(String(keyVal)) + "'";
    const url = `${this.baseUrl}/api/data/${this.apiVersion}/${entitySet}(${encodedKey})`;
    const res = await adaptiveFetch(url, { method:'PATCH', headers: { ...tokenHeader, 'content-type':'application/json', 'If-Match': '*' }, body: JSON.stringify(fields) }, { maxRetries: 4 });
    if (res.status === 204) { this.metrics.inc('dyn_upsert_total'); return { status:204, mode:'update' }; }
    if (res.status === 404){
      // Create
      const createUrl = `${this.baseUrl}/api/data/${this.apiVersion}/${entitySet}`;
      const res2 = await adaptiveFetch(createUrl, { method:'POST', headers: { ...tokenHeader, 'content-type':'application/json' }, body: JSON.stringify({ [altKeyAttr]: keyVal, ...fields }) }, { maxRetries: 4 });
      if (res2.status === 204 || res2.status === 201){ this.metrics.inc('dyn_upsert_total'); return { status:201, mode:'create' }; }
      this.metrics.inc('dyn_errors_total'); throw new Error('create failed '+res2.status+' '+await res2.text());
    }
    if (res.ok){ this.metrics.inc('dyn_upsert_total'); return { status: res.status }; }
    this.metrics.inc('dyn_errors_total'); throw new Error('upsert failed '+res.status+' '+await res.text());
  }
}
