import { OAuthCC } from './oauth.js';
import { Mapper } from './mapper.js';
import { DynClient } from './client.js';
import { DLQ } from './dlq.js';
import { Metrics } from './metrics.js';

export class DynamicsConnector {
  constructor({ mappingPath, metricsPort }={}){
    this.cfg = {
      tenantId: process.env.DYN_TENANT_ID,
      clientId: process.env.DYN_CLIENT_ID,
      clientSecret: process.env.DYN_CLIENT_SECRET,
      scope: process.env.DYN_SCOPE, // https://<org>.crm.dynamics.com/.default
      baseUrl: process.env.DYN_BASE_URL // https://<org>.crm.dynamics.com
    };
    this.oauth = new OAuthCC(this.cfg);
    this.mapper = new Mapper(mappingPath || new URL('./mapping.yaml', import.meta.url).pathname);
    this.metrics = new Metrics({ port: metricsPort || process.env.METRICS_PORT });
    this.client = new DynClient({ baseUrl: this.cfg.baseUrl, oauth: this.oauth, metrics: this.metrics });
    this.dlq = new DLQ({ redisUrl: process.env.REDIS_URL });
  }

  async processEvent(evt){
    const type = evt.type;
    const m = this.mapper.forType(type);
    const entitySet = m.entitySet();
    const altKey = m.alternateKey();
    const keyVal = m.keyValue(evt);
    const fields = m.fields(evt);
    try{
      await this.client.upsert(entitySet, altKey, keyVal, fields);
    }catch(e){
      await this.dlq.push({ event: evt, error: String(e) });
      const depth = await this.dlq.depth();
      this.metrics.setDlqDepth(depth);
      throw e;
    }
  }
}
