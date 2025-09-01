
// Write-back policy: thresholds, PII guards, Secure edition rails
import { maskPII } from '../pii.js';

const HIGH_VALUE_DEAL = 500000;
const AUTO_APPLY_MIN_CONF = 0.85;

function isSecureReadOnly(){
  const force = (process.env.force_read_only||process.env.FORCE_READ_ONLY||'false').toString().toLowerCase()==='true';
  const securePolicy = (process.env.SECURE_EDITION||'false').toString().toLowerCase()==='true';
  const disableAuto = (process.env.disable_automatic_writebacks||'false').toString().toLowerCase()==='true';
  return force || securePolicy || disableAuto;
}

export function applyWritebackIfPermitted(suggestion, user){
  // RBAC check
  const roles = user?.roles||[];
  const isApprover = roles.includes('admin') || roles.includes('data_steward');
  if(!isApprover){ return { allowed:false, reason:'rbac_denied' }; }

  // Secure read-only rail
  if(isSecureReadOnly()){ return { allowed:false, reason:'secure_read_only' }; }

  const after = suggestion?.after || {};
  const amt = Number(after.amount||suggestion.before?.amount||0);
  const conf = Number(suggestion?.confidence||0);

  if(amt >= HIGH_VALUE_DEAL){ return { allowed:false, reason:'high_value_manual_only' }; }

  if(conf >= AUTO_APPLY_MIN_CONF){ return { allowed:true }; }

  return { allowed:false, reason:'low_confidence' };
}

export function redactPIIForDisplay(payload){
  return maskPII(payload);
}
export default { applyWritebackIfPermitted, redactPIIForDisplay };
