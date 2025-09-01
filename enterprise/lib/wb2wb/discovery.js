// Silent discovery between tenants with a real relation
import { wb2wbLinksTotal } from '../metrics/registry.js';
export async function upsertWb2WbLink(db, tenantA, tenantB, relationType, source){
  try{
    const a=String(tenantA), b=String(tenantB);
    const [minT, maxT] = a < b ? [a,b] : [b,a];
    await db.run?.(`INSERT OR IGNORE INTO wb2wb_links(tenant_a,tenant_b,relation_type,source) VALUES(?,?,?,?)`, [minT,maxT,relationType,source||null]);
    wb2wbLinksTotal.labels(minT).inc();
    return { ok:true };
  }catch(e){ return { ok:false, error:'link_upsert_failed' }; }
}
