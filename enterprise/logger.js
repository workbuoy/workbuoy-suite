function redact(s){
  try{
    if(typeof s !== 'string') s = JSON.stringify(s);
    s = s.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,'<redacted:email>');
    s = s.replace(/\b\+?\d[\d\s().-]{7,}\b/g,'<redacted:phone>');
    s = s.replace(/(api|bearer|token|secret|key)=([A-Za-z0-9-_]+)/gi,'$1=<redacted:token>');
    return s;
  }catch(e){ return '<unloggable>'; }
}
export function log(level, msg, meta){
  const line = JSON.stringify({ level, msg: redact(msg||''), meta: redact(meta||{}), ts: new Date().toISOString() });
  // eslint-disable-next-line no-console
  console.log(line);
}
export default { log };
