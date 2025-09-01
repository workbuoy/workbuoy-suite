import { OAuth2 } from './oauth.js';
import { Mapper } from './mapper.js';
import { SFClient } from './client.js';
import { DLQ } from './dlq.js';
import { Metrics } from './metrics.js';

export class SalesforceConnector {
  constructor({ configPath, mappingPath, metricsPort }={}){
    this.cfg = {
      tokenUrl: process.env.SF_TOKEN_URL,
      clientId: process.env.SF_CLIENT_ID,
      clientSecret: process.env.SF_CLIENT_SECRET,
      refreshToken: process.env.SF_REFRESH_TOKEN,
      instanceUrl: process.env.SF_INSTANCE_URL
    };
    this.oauth = new OAuth2(this.cfg);
    this.mapper = new Mapper(mappingPath || new URL('./mapping.yaml', import.meta.url).pathname);
    this.metrics = new Metrics({ port: metricsPort || process.env.METRICS_PORT });
    this.sf = new SFClient({ instanceUrl: this.cfg.instanceUrl, oauth: this.oauth, metrics: this.metrics });
    this.dlq = new DLQ({ redisUrl: process.env.REDIS_URL });
  }

  async processEvent(evt){
    const type = evt.type; // 'contact' | 'opportunity'
    const m = this.mapper.forType(type);
    const externalField = m.externalIdField();
    const externalValue = m.externalIdValue(evt);
    const fields = m.fields(evt);
    try{
      await this.sf.upsert(m.objectName(), externalField, externalValue, fields);
    }catch(e){
      await this.dlq.push({ event: evt, error: String(e) });
      const depth = await this.dlq.depth();
      this.metrics.setDlqDepth(depth);
      throw e;
    }
  }
}
