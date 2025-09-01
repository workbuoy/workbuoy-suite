// CXM Intelligence v2.3 — Cohort Boost helpers
// Key format: role + ':' + customer_tier
export function cohortKey(role, customerTier){
  const r = String(role||'').trim() || 'unknown';
  const t = String(customerTier||'').trim() || 'unknown';
  return `${r}:${t}`;
}
// Damp when personalConfidence is strong
export function effectiveCohortBoost(cohortBoost, personalConfidence){
  const cb = Number.isFinite(cohortBoost) ? cohortBoost : 0;
  const pc = Math.max(0, Math.min(1, Number(personalConfidence)||0));
  return cb * (1 - pc);
}
export default { cohortKey, effectiveCohortBoost };
