// Secure wb2wb policy engine
export const DEFAULT_POLICY = {
  MUST_HAVE: ['order_status', 'delivery_update', 'capacity_confirm', 'critical_alert'],
  NICE_TO_SHARE: ['forecast', 'aggregated_volume', 'quality_report'],
  NEVER: ['prices', 'margins', 'other_customers', 'contracts']
};
export function evaluatePolicy(policy, eventType){
  const p = policy || DEFAULT_POLICY;
  if (p.NEVER?.includes(eventType)) return { allow:false, reason:'never' };
  if (p.MUST_HAVE?.includes(eventType)) return { allow:true, reason:'must_have' };
  if (p.NICE_TO_SHARE?.includes(eventType)) {
    const opted = !!(p.optIn?.includes?.(eventType));
    return { allow: opted, reason: opted ? 'opt_in' : 'not_opted' };
  }
  return { allow:false, reason:'unknown' };
}
