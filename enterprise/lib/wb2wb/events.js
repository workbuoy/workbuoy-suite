import { evaluatePolicy, DEFAULT_POLICY } from './policy.js';
import { wb2wbEventsTotal, wb2wbPolicyBlocksTotal } from '../metrics/registry.js';
import { isWb2WbEnabled } from '../config/feature-flags.js';

export async function handleWb2WbEvent({ db, tenantId, counterpartyTenant, eventType, payload, getTenantSettings, policy }){
  if(!isWb2WbEnabled()) return { ok:false, skipped:true, reason:'global_disabled' };
  const settings = await (getTenantSettings?.(tenantId) || { wb2wb_enabled: 1 });
  const cp = await (getTenantSettings?.(counterpartyTenant) || { wb2wb_enabled: 1 });
  const t = String(tenantId);
  if(!settings.wb2wb_enabled || !cp.wb2wb_enabled){
    wb2wbEventsTotal.labels(t,'blocked').inc();
    wb2wbPolicyBlocksTotal.labels(t,'tenant_disabled').inc();
    return { ok:false, skipped:true, reason:'tenant_disabled' };
  }
  const pol = policy || DEFAULT_POLICY;
  const res = evaluatePolicy(pol, eventType);
  if(!res.allow){
    wb2wbEventsTotal.labels(t,'blocked').inc();
    wb2wbPolicyBlocksTotal.labels(t, res.reason).inc();
    return { ok:false, skipped:true, reason:res.reason };
  }
  wb2wbEventsTotal.labels(t,'sent').inc();
  // Delivery is out of scope here; higher layer performs minimal, non-PII payload transfer
  return { ok:true, delivered:true };
}
