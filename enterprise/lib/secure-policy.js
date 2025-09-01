// lib/secure-policy.js
import fs from 'fs';
import path from 'path';

export function loadSecurePolicy(){
  try{
    if(process.env.SECURE_POLICY_JSON){
      return JSON.parse(process.env.SECURE_POLICY_JSON);
    }
    const p = path.join(process.cwd(), 'secure.policy.json');
    if(fs.existsSync(p)){
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  }catch(e){
    console.error('Failed to load secure.policy.json', e);
  }
  // Default: safest (deny autonomy unless explicitly allowed)
  return { allow_autonomy: false };
}

export function assertAutonomyAllowed(){
  const policy = loadSecurePolicy();
  if(policy.allow_autonomy === false){
    const err = new Error('Autonomy is disabled by secure.policy.json (allow_autonomy=false)');
    err.status = 403;
    throw err;
  }
}
