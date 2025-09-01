import fetch from 'node-fetch';

export class SFClient {
  constructor({ instanceUrl, oauth, apiVersion='v58.0', metrics }){
    this.instanceUrl = instanceUrl.replace(/\/$/,''); // no trailing slash
    this.oauth = oauth;
    this.apiVersion = apiVersion;
    this.metrics = metrics || { inc: ()=>{} };
  }

  async upsert(object, externalField, externalValue, fields){
    const tokenHeader = await this.oauth.authHeader();
    const url = `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/${encodeURIComponent(object)}/${encodeURIComponent(externalField)}/${encodeURIComponent(externalValue)}`;
    const res = await fetch(url, { method:'PATCH', headers: { ...tokenHeader, 'content-type':'application/json' }, body: JSON.stringify(fields) });
    if (res.status === 201 || res.status === 204){
      this.metrics.inc('sf_upsert_total');
      return { status: res.status };
    }
    const txt = await res.text();
    this.metrics.inc('sf_errors_total');
    const err = new Error(`SF upsert ${res.status}: ${txt}`);
    err.status = res.status;
    throw err;
  }
}
