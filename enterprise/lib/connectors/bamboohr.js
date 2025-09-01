// lib/connectors/bamboohr.js
import fetch from 'node-fetch';

/**
 * BambooHRConnector
 * Auth: API key (Basic auth with API key as username, x for password) – subdomain required.
 */
export class BambooHRConnector {
  constructor({ subdomain, apiKey } = {}){
    if(!subdomain) throw new Error('bamboo_subdomain_required');
    this.baseUrl = `https://api.bamboohr.com/api/gateway.php/${subdomain}/v1`;
    if(!apiKey) throw new Error('bamboo_api_key_required');
    const b64 = Buffer.from(`${apiKey}:x`).toString('base64');
    this.authHeader = `Basic ${b64}`;
  }
  async _req(path){
    const r = await fetch(`${this.baseUrl}${path}`, { headers: { 'Accept': 'application/json', 'Authorization': this.authHeader } });
    if(!r.ok){
      const t = await r.text().catch(()=>'');
      const msg = `bamboo_http_${r.status}`;
      throw Object.assign(new Error(msg), { status:r.status, body:t });
    }
    return r.json();
  }
  async fetchEmployees({ fields = ['firstName','lastName','jobTitle','workEmail','department','location','lastChanged'], since } = {}){
    const qs = new URLSearchParams({ fields: fields.join(',') });
    const data = await this._req(`/employees/directory?${qs.toString()}`);
    let employees = (data.employees || []).map(e => ({
      id: e.id, firstName: e.firstName, lastName: e.lastName,
      email: e.workEmail || null, jobTitle: e.jobTitle || null,
      department: e.department || null, location: e.location || null,
      lastChanged: e.lastChanged || null
    }));
    if(since){
      const t0 = Date.parse(since);
      if(!isNaN(t0)) employees = employees.filter(e => !e.lastChanged || Date.parse(e.lastChanged) >= t0);
    }
    return employees;
  }
}
export default BambooHRConnector;
