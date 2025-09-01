import { SecureCache } from '../desktop/cache/secure_cache.js';

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

export class SyncEngine {
  constructor({ baseUrl, headers, mergePolicy='lww', concurrency=6, maxRetries=5 }){
    this.baseUrl = baseUrl;
    this.headers = headers || (()=>({'content-type':'application/json','x-user-role':'admin'}));
    this.mergePolicy = mergePolicy; // 'lww' or 'merge'
    this.concurrency = concurrency;
    this.maxRetries = maxRetries;
    this.cache = new SecureCache();
    this.metrics = { attempted:0, succeeded:0, failed:0 };
  }

  async enqueueCreateContact(payload){ this.cache.append({ op:'create_contact', payload, ts: Date.now(), retries:0 }); }

  async _processItem(item){
    const url = `${this.baseUrl}/api/v1/crm/contacts`;
    const res = await fetch(url, { method:'POST', headers: this.headers(), body: JSON.stringify(item.payload) });
    if (res.status === 409) {
      // conflict – resolve: fetch remote record and reconcile
      const rid = (await res.json()).id || item.payload.id;
      const remote = await (await fetch(`${this.baseUrl}/_admin/contacts/${rid}`)).json();
      const local = item.payload;
      const merged = this.mergePolicy === 'merge' ? { ...remote, ...local } :
                      (local.updated_at > remote.updated_at ? local : remote);
      const pr = await fetch(`${this.baseUrl}/api/v1/crm/contacts/${rid}`, { method:'PATCH', headers: this.headers(), body: JSON.stringify(merged) });
      if (!pr.ok) throw new Error('patch failed '+pr.status);
      return;
    }
    if (!res.ok) throw new Error('HTTP '+res.status);
  }

  async syncOnce(){
    const q = this.cache.loadQueue();
    const remaining = [];
    const batches = Array.from({length:this.concurrency}, ()=>[]);
    q.forEach((item,i)=> batches[i%this.concurrency].push(item));

    for (const bucket of batches){
      const tasks = bucket.map(async (item)=>{
        this.metrics.attempted++;
        try{
          await this._processItem(item);
          this.metrics.succeeded++;
        }catch(e){
          item.retries = (item.retries||0)+1;
          if (item.retries < this.maxRetries) remaining.push(item);
          else this.metrics.failed++;
          await sleep(10);
        }
      });
      await Promise.all(tasks);
    }
    this.cache.saveQueue(remaining);
    return { before: q.length, after: remaining.length, metrics: this.metrics };
  }
}
