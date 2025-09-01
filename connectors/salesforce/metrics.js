import client from 'prom-client';
import http from 'http';

export class Metrics {
  constructor({ port }={}){
    this.registry = new client.Registry();
    client.collectDefaultMetrics({ register: this.registry });

    this.counters = {
      upsert: new client.Counter({ name:'sf_upsert_total', help:'Upserts ok', registers:[this.registry]}),
      errors: new client.Counter({ name:'sf_errors_total', help:'Errors total', registers:[this.registry]}),
      token_refresh: new client.Counter({ name:'sf_token_refresh_total', help:'Token refreshes', registers:[this.registry]}),
      dlq: new client.Gauge({ name:'sf_dlq_depth', help:'DLQ depth', registers:[this.registry]})
    };

    if (port){
      this.server = http.createServer(async (_req,res)=>{
        res.writeHead(200, {'content-type':'text/plain'});
        res.end(await this.registry.metrics());
      }).listen(port);
    }
  }
  inc(name){ 
    if (name==='sf_upsert_total') this.counters.upsert.inc();
    else if (name==='sf_errors_total') this.counters.errors.inc();
    else if (name==='sf_token_refresh_total') this.counters.token_refresh.inc();
  }
  setDlqDepth(n){ this.counters.dlq.set(n); }
}
