const fs = require('node:fs');
const path = require('node:path');
const Store = require('electron-store');
const { verifyManifest, sha256sum } = require('./signature');
const hubspot = require('./hubspot');
const gcal    = require('./google-calendar');
const o365    = require('./office365');

const registry = {
  [hubspot.key]: hubspot,
  [gcal.key]: gcal,
  [o365.key]: o365,
};

function manifestFor(key) {
  const p = path.join(__dirname, 'manifest', key + '.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p,'utf-8')); } catch { return null; }
}

function list(store) {
  return Object.values(registry).map(a => {
    const m = manifestFor(a.key);
    const status = (!m ? 'unsigned' : 'unknown');
    return ({ key: a.key, name: a.name, version: a.version, enabled: !!a.enabled(store), manifestStatus: status });
  });
}

function enabledCount(store) {
  return list(store).filter(p => p.enabled).length;
}

async function verifyAdapter(key) {
  const fileMap = { 'hubspot':'hubspot.js', 'google-calendar':'google-calendar.js', 'office365':'office365.js' };
  const adapter = registry[key];
  if (!adapter) return { ok:false, reason:'unknown' };
  const m = manifestFor(key);
  if (!m) return { ok:false, reason:'unsigned' };
  // Build canonical data buffer from adapter file for integrity; simple approach: read the adapter js file
  const adapterPath = path.join(__dirname, fileMap[key] || (key + '.js'));
  let buf = Buffer.from('');
  try {
    if (fs.existsSync(adapterPath)) buf = fs.readFileSync(adapterPath);
    else buf = Buffer.from(adapter.key + ':' + adapter.version);
  } catch {}
  const res = verifyManifest(m, buf);
  return res;
}

function enable(store, key, enabled, metrics) {
  const adapter = registry[key];
  if (!adapter) return { ok:false, error:'unknown_plugin' };
  if (enabled) {
    // verify before enabling
    return verifyAdapter(key).then((v)=> {
      if (!v.ok) { try { metrics?.incPluginSignatureFailures?.(1); } catch {} ; return { ok:false, error: 'signature_invalid', ...v }; }
      adapter.enable(store, true);
      return { ok:true };
    });
  } else {
    adapter.enable(store, false);
    return Promise.resolve({ ok:true });
  }
}

module.exports = { registry, list, enabledCount, enable, verifyAdapter };
