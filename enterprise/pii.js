import fs from 'fs';
import path from 'path';

function loadPolicy(){
  try{
    const p = path.join(process.cwd(),'public','config','secure.policy.json');
    return JSON.parse(fs.readFileSync(p,'utf8'));
  }catch(e){ return { masking: false }; }
}

const EMAIL_RE=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
const PHONE_RE=/(\+?\d[\d\s\-()]{6,}\d)/g;

export function maskPII(value){
  const policy = loadPolicy();
  if(!policy.masking) return value;
  const replacer = (k,v)=>{
    if(v && typeof v === 'string'){
      return v.replace(EMAIL_RE,'[email]')
              .replace(PHONE_RE,'[phone]');
    }
    return v;
  };
  try{
    return JSON.parse(JSON.stringify(value, replacer));
  }catch(_){ return value; }
}
