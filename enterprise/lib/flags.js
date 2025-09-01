// Feature flags with safe fallbacks
function bool(name, def=false){
  const v = (process.env[name]||'').toString().toLowerCase();
  if(v==='true') return true;
  if(v==='false') return false;
  return def;
}
export const ENABLE_BATCH_SCORING = bool('ENABLE_BATCH_SCORING', true);
export const ENABLE_SIGNAL_BUDGET = bool('ENABLE_SIGNAL_BUDGET', false);
export const ENABLE_VERIFIED_LEARNING = bool('ENABLE_VERIFIED_LEARNING', false);
export default { ENABLE_BATCH_SCORING, ENABLE_SIGNAL_BUDGET, ENABLE_VERIFIED_LEARNING, ENABLE_DATA_CLEANUP, ENABLE_CIRCUIT_BREAKERS, ENABLE_PERF_AUTOTUNE };

export const ENABLE_DATA_CLEANUP = bool('ENABLE_DATA_CLEANUP', true);
export const ENABLE_CIRCUIT_BREAKERS = bool('ENABLE_CIRCUIT_BREAKERS', true);
export const ENABLE_PERF_AUTOTUNE = bool('ENABLE_PERF_AUTOTUNE', true);
