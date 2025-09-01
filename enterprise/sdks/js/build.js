const fs = require('fs'); const path = require('path');
const outDir = path.join(__dirname, 'dist'); if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive:true });
fs.writeFileSync(path.join(outDir,'index.js'), `
export class WorkBuoy {
  constructor({ apiKey, baseUrl, tenant }){ this.apiKey=apiKey; this.baseUrl=baseUrl; this.tenant=tenant; }
  async get(path){ const r = await fetch(this.baseUrl+path, { headers:{ 'x-api-key': this.apiKey, 'x-tenant-id': this.tenant } }); return r.json(); }
  async post(path, body){ const r = await fetch(this.baseUrl+path, { method:'POST', headers:{ 'x-api-key': this.apiKey, 'x-tenant-id': this.tenant, 'content-type':'application/json' }, body: JSON.stringify(body||{}) }); return r.json(); }
}
`);
console.log('SDK JS built.');
