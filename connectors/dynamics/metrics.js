import client from 'prom-client';
import http from 'http';

export class Metrics {
  constructor({ port }={}){
    this.registry = new client.Registry();
    client.collectDefaultMetrics({ register: this.registry });

    this.counters = {
      upsert: new client.Counter({ name:'dyn_upsert_total', help:'Upserts ok', registers:[this.registry]}),
      errors: new client.Counter({ name:'dyn_errors_total', help:'Errors total', registers:[this.registry]}),
      token: new client.Counter({ name:'dyn_token_fetch_total', help:'Token fetches', registers:[this.registry]}),
      dlq: new client.Gauge({ name:'dyn_dlq_depth', help:'DLQ depth', registers:[this.registry]})
    };

    if (port){
      this.server = http.createServer(async (_req,res)=>{
        res.writeHead(200, {'content-type':'text/plain'});
        res.end(await this.registry.metrics());
      }).listen(port);
    }
  }
  inc(name){ 
    if (name==='dyn_upsert_total') this.counters.upsert.inc();
    else if (name==='dyn_errors_total') this.counters.errors.inc();
    else if (name==='dyn_token_fetch_total') this.counters.token.inc();
  }
  setDlqDepth(n){ this.counters.dlq.set(n); }
}
