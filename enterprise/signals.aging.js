// CXM Intelligence v2.3 — Sharper Decay
// Export a decay curve and helper that multiplies with an external agingFactor.
export function contextDecay(daysSinceLastContact){
  const v = 1 - Math.pow(daysSinceLastContact / 30, 1.2);
  return Math.max(0.3, Math.min(1.0, v));
}
// Combine with an incoming agingFactor (default 1)
export function decayWithFactor(daysSinceLastContact, agingFactor=1){
  const base = contextDecay(daysSinceLastContact);
  const factor = Number.isFinite(agingFactor) ? agingFactor : 1;
  return Math.max(0, base * factor);
}
export default contextDecay;
