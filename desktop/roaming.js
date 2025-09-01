const { encrypt, decrypt } = require('./secrets');
const log = require('./logger');

async function pushState(fetch, baseUrl, authHeaders, payload) {
  try {
    const enc = encrypt(Buffer.from(JSON.stringify(payload)));
    const res = await fetch(`${baseUrl}/desktop/state`, { method:'POST', headers: { 'content-type':'application/json', ...authHeaders }, body: JSON.stringify(enc) });
    return res.ok;
  } catch (e) { log.warn('roaming push failed', e.message); return false; }
}

async function pullState(fetch, baseUrl, authHeaders) {
  try {
    const res = await fetch(`${baseUrl}/desktop/state`, { headers: { ...authHeaders } });
    if (!res.ok) return null;
    const obj = await res.json();
    const buf = decrypt(obj);
    return JSON.parse(buf.toString('utf8')||'{}');
  } catch (e) { log.warn('roaming pull failed', e.message); return null; }
}

async function pushSettings(fetch, baseUrl, authHeaders, settings) {
  return pushState(fetch, baseUrl, authHeaders, { type:'settings', data: settings });
}

async function pullSettings(fetch, baseUrl, authHeaders) {
  const s = await pullState(fetch, baseUrl, authHeaders); 
  return s && s.type==='settings' ? s.data : null;
}

module.exports = { pushState, pullState, pushSettings, pullSettings };
