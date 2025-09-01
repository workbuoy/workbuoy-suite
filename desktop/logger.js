const log = require('electron-log');
const isJson = process.env.WB_LOG_JSON === '1';

const SENSITIVE_KEYS = ['authorization','set-cookie','email','phone','token','access_token','refresh_token'];
const SENSITIVE_RE = /(bearer\s+[a-z0-9\._-]+|api[_-]?key[:=]\s*\w+|set-cookie:[^;\n]+|email:[^\s]+@[^\s]+|phone:\+?\d[\d\s-]{7,})/ig;

function maskValue(val) {
  if (val == null) return val;
  const s = String(val);
  return s.replace(SENSITIVE_RE, '[REDACTED]');
}
function redact(obj) {
  if (!obj || typeof obj !== 'object') return maskValue(obj);
  const out = Array.isArray(obj) ? [] : {};
  for (const k of Object.keys(obj)) {
    if (SENSITIVE_KEYS.includes(k.toLowerCase())) out[k] = '[REDACTED]';
    else if (typeof obj[k] === 'object') out[k] = redact(obj[k]);
    else out[k] = maskValue(obj[k]);
  }
  return out;
}
function fmt(level, args) {
  if (!isJson) return args.map(a=> typeof a==='object'? JSON.stringify(redact(a)) : maskValue(a)).join(' ');
  const entry = { level, ts: Date.now(), msg: '', ctx: {} };
  if (args.length===1 && typeof args[0]==='object') entry.ctx = redact(args[0]);
  else entry.msg = args.map(a=> typeof a==='object'? JSON.stringify(redact(a)) : maskValue(a)).join(' ');
  return JSON.stringify(entry);
}

['info','warn','error','debug'].forEach(fn=>{
  const orig = log[fn].bind(log);
  log[fn] = (...args)=> orig(fmt(fn, args));
});

module.exports = log;

module.exports.create = (scope = 'app') => ({
  info:  (...args) => module.exports.info({ scope, args }),
  warn:  (...args) => module.exports.warn({ scope, args }),
  error: (...args) => module.exports.error({ scope, args }),
  debug: (...args) => module.exports.debug({ scope, args }),
});
