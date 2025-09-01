// Base connector abstraction (stub-friendly)
export class BaseConnector {
  constructor(name, opts={}, deps={}){
    this.name = name; this.opts = opts; this.deps = deps;
  }
  enabled(){
    const key = `WB_CONNECTOR_${this.name.toUpperCase()}_ENABLED`;
    const v = (process.env[key]||'').toLowerCase();
    return v==='true';
  }
  // Optional OAuth endpoints
  authUrl(){ return null; }
  async handleOAuthCallback(_query){ return { ok:true }; }
  // Data fetch
  async fetchEntities(_since){ return []; }
  // Webhook handler
  async handleWebhook(_req,_res){ return { ok:true }; }
  // Map to internal signals
  mapToSignals(entities){
    return (entities||[]).map(e=>({
      ts: e.ts || new Date().toISOString(),
      type: e.type || 'event',
      title: e.title || `${this.name} event`,
      payload: e,
      entityId: e.id || null,
      accountId: e.accountId || null,
    }));
  }
  async upsertSignals(signals){
    if(!signals?.length) return { inserted:0 };
    return await this.deps.signals.ingest(signals.map(s=>({ ...s, source:this.name })));
  }
}
export default BaseConnector;
