#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const POLICY_PATH = process.env.POLICY_PATH || path.join(process.cwd(), 'update/policies/rollout.json');

function load(){ try { return JSON.parse(fs.readFileSync(POLICY_PATH,'utf8')); } catch { return { channels:{} }; } }
function save(obj){ fs.mkdirSync(path.dirname(POLICY_PATH), { recursive: true }); fs.writeFileSync(POLICY_PATH, JSON.stringify(obj, null, 2)); }

const args = Object.fromEntries(process.argv.slice(2).map((a,i,arr)=> a.startsWith('--') ? [a.replace(/^--/,''), arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : true] : []).filter(Boolean));
const cmd = args._ || process.argv[2];

function usage(){
  console.log(`Usage:
  policyctl set --channel <stable|beta> [--percent 30] [--allow-os windows,mac,linux] [--min 1.0.0] [--max 2.0.0]
  policyctl hold --channel <c> --on true|false
  policyctl revoke --channel <c> --version <v>
  policyctl show
`);
}

async function main(){
  const pol = load();
  const sub = process.argv[2];
  if (sub === 'show'){ console.log(JSON.stringify(pol, null, 2)); return; }
  if (sub === 'set'){
    const ch = args.channel; if (!ch) return usage();
    pol.channels = pol.channels || {};
    const c = pol.channels[ch] = { ...(pol.channels[ch]||{}) };
    if (args.percent !== undefined) c.percent = Number(args.percent);
    if (args['allow-os']) {
      const arr = String(args['allow-os']).split(',').map(s=>s.trim().toLowerCase());
      c.allow_os = { windows: arr.includes('windows'), mac: arr.includes('mac'), linux: arr.includes('linux') };
    }
    if (args.min !== undefined) c.min_version = args.min;
    if (args.max !== undefined) c.max_version = args.max;
    save(pol); console.log(JSON.stringify(c, null, 2)); return;
  }
  if (sub === 'hold'){
    const ch = args.channel; const on = String(args.on||'false') === 'true';
    pol.channels = pol.channels || {}; const c = pol.channels[ch] = { ...(pol.channels[ch]||{}) };
    c.hold = on; save(pol); console.log(JSON.stringify(c, null, 2)); return;
  }
  if (sub === 'revoke'){
    const ch = args.channel; const v = args.version;
    pol.channels = pol.channels || {}; const c = pol.channels[ch] = { ...(pol.channels[ch]||{}) };
    c.revoked = Array.isArray(c.revoked)? c.revoked : [];
    if (!c.revoked.includes(v)) c.revoked.push(v);
    save(pol); console.log(JSON.stringify(c, null, 2)); return;
  }
  usage();
}
main().catch(e=>{ console.error(e); process.exit(1); });
