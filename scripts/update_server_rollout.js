// Update server with rollout policies, hold/revoke, and gating per client/OS.
// Endpoints:
//   GET  /feed/:channel/latest.json   (requires headers: x-client-id, x-os, x-current-version)
//   GET  /policy                      (json policy view)
//   POST /admin/hold                 { channel, hold: true|false }
//   POST /admin/revoke               { channel, version }
//   POST /admin/set                  { channel, percent, allow_os?, min_version?, max_version? }
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import crypto from 'crypto';

const PORT = Number(process.env.PORT || 45910);
const REPO = process.env.UPDATE_REPO || path.join(process.cwd(), 'update_repo');
const POLICY_PATH = process.env.POLICY_PATH || path.join(process.cwd(), 'update/policies/rollout.json');

function readJSON(p){ try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return null; } }
function writeJSON(p, obj){ fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }

function hashToPercent(id){
  const h = crypto.createHash('sha256').update(String(id)).digest('hex');
  const n = parseInt(h.slice(0,8), 16); // 32-bit
  return (n % 100); // 0..99
}

function cmpVer(a,b){
  const pa = String(a||'0').split(/[.-]/).map(x=> isNaN(x)? x : Number(x));
  const pb = String(b||'0').split(/[.-]/).map(x=> isNaN(x)? x : Number(x));
  const len = Math.max(pa.length, pb.length);
  for (let i=0;i<len;i++){
    const va = pa[i]===undefined?0:pa[i];
    const vb = pb[i]===undefined?0:pb[i];
    if (typeof va === 'number' && typeof vb === 'number'){
      if (va>vb) return 1; if (va<vb) return -1;
    } else {
      const sa = String(va), sb = String(vb);
      if (sa>sb) return 1; if (sa<sb) return -1;
    }
  }
  return 0;
}

function loadFeed(channel){
  const p = path.join(REPO, channel, 'latest.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p,'utf8'));
}

function loadPrev(channel){
  const p = path.join(REPO, channel, 'prev.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p,'utf8'));
}

function allowByPolicy(policy, channel, client){
  const pc = policy?.channels?.[channel];
  if (!pc) return { allowed:false, reason:'no_policy' };
  if (pc.hold) return { allowed:false, reason:'held' };
  if (pc.allow_os && pc.allow_os[client.os] === false) return { allowed:false, reason:'os_blocked' };
  if (pc.min_version && cmpVer(client.current, pc.min_version) < 0) return { allowed:false, reason:'below_min' };
  if (pc.max_version && cmpVer(client.current, pc.max_version) > 0) return { allowed:false, reason:'above_max' };
  const p = Number(pc.percent ?? 100);
  const gate = hashToPercent(client.id);
  if (gate >= p) return { allowed:false, reason:'gated' };
  return { allowed:true };
}

function serveJSON(res, code, obj){
  res.writeHead(code, {'content-type':'application/json'});
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req,res)=>{
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/' || parsed.pathname === '/health'){
    return serveJSON(res, 200, { ok:true, repo: REPO });
  }
  if (parsed.pathname === '/policy'){
    const pol = readJSON(POLICY_PATH) || {};
    return serveJSON(res, 200, pol);
  }
  if (req.method==='POST' && parsed.pathname === '/admin/hold'){
    let body=''; req.on('data',d=>body+=d); req.on('end', ()=>{
      try{
        const { channel, hold } = JSON.parse(body||'{}');
        const pol = readJSON(POLICY_PATH) || { channels:{} };
        pol.channels = pol.channels || {};
        pol.channels[channel] = { ...(pol.channels[channel]||{}), hold: !!hold };
        writeJSON(POLICY_PATH, pol);
        serveJSON(res, 200, { ok:true, hold: !!hold, channel });
      }catch(e){ serveJSON(res, 400, { ok:false, error:String(e) }); }
    });
    return;
  }
  if (req.method==='POST' && parsed.pathname === '/admin/revoke'){
    let body=''; req.on('data',d=>body+=d); req.on('end', ()=>{
      try{
        const { channel, version } = JSON.parse(body||'{}');
        const pol = readJSON(POLICY_PATH) || { channels:{} };
        pol.channels = pol.channels || {};
        const c = pol.channels[channel] = { ...(pol.channels[channel]||{}) };
        c.revoked = Array.isArray(c.revoked) ? c.revoked : [];
        if (!c.revoked.includes(version)) c.revoked.push(version);
        writeJSON(POLICY_PATH, pol);
        serveJSON(res, 200, { ok:true, revoked:c.revoked });
      }catch(e){ serveJSON(res, 400, { ok:false, error:String(e) }); }
    });
    return;
  }
  if (req.method==='POST' && parsed.pathname === '/admin/set'){
    let body=''; req.on('data',d=>body+=d); req.on('end', ()=>{
      try{
        const { channel, percent, allow_os, min_version, max_version } = JSON.parse(body||'{}');
        const pol = readJSON(POLICY_PATH) || { channels:{} };
        pol.channels = pol.channels || {};
        const c = pol.channels[channel] = { ...(pol.channels[channel]||{}) };
        if (percent !== undefined) c.percent = Number(percent);
        if (allow_os) c.allow_os = allow_os;
        if (min_version !== undefined) c.min_version = min_version;
        if (max_version !== undefined) c.max_version = max_version;
        writeJSON(POLICY_PATH, pol);
        serveJSON(res, 200, { ok:true, channel, policy:c });
      }catch(e){ serveJSON(res, 400, { ok:false, error:String(e) }); }
    });
    return;
  }

  const m = parsed.pathname && parsed.pathname.match(/^\/feed\/(stable|beta)\/latest\.json$/);
  if (m && req.method==='GET'){
    const channel = m[1];
    const pol = readJSON(POLICY_PATH) || {};
    const client = {
      id: req.headers['x-client-id'] || 'anon',
      os: (req.headers['x-os'] || '').toLowerCase() || 'linux',
      current: req.headers['x-current-version'] || '0.0.0'
    };

    const baseFeed = loadFeed(channel);
    if (!baseFeed) return serveJSON(res, 404, { error:'no_feed' });

    const pc = pol?.channels?.[channel] || {};
    // revoke handling
    const revoked = Array.isArray(pc.revoked)? pc.revoked : [];
    let feed = { ...baseFeed };
    if (revoked.includes(baseFeed.version)){
      const prev = loadPrev(channel);
      if (prev) feed = prev;
    }

    // allow?
    const decision = allowByPolicy(pol, channel, client);
    if (!decision.allowed) return serveJSON(res, 204, { ok:false, reason: decision.reason });

    // if client already on latest or higher, no update
    if (cmpVer(client.current, feed.version) >= 0){
      return serveJSON(res, 204, { ok:true, upToDate:true });
    }

    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify(feed));
    return;
  }

  // artifacts passthrough (reuse from PR AG format)
  const artMatch = parsed.pathname && parsed.pathname.match(/^\/artifacts\/(.+)$/);
  if (artMatch){
    const file = path.join(REPO, 'artifacts', artMatch[1]);
    try {
      const data = fs.readFileSync(file);
      res.writeHead(200, {'content-type':'application/octet-stream'});
      res.end(data);
    } catch {
      res.writeHead(404); res.end('not found');
    }
    return;
  }

  res.writeHead(404); res.end('not found');
});

server.listen(PORT, ()=>console.log('Rollout update server on :'+PORT+' repo='+REPO));
