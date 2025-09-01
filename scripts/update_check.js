// Simulate electron-updater: read feed for channel and verify expected version/artifact
// Usage: node scripts/update_check.js --channel stable --expect-version 1.0.0 [--url http://.../latest.json]
import fs from 'fs';

const args = Object.fromEntries(process.argv.slice(2).map((a,i,arr)=> a.startsWith('--') ? [a.replace(/^--/,''), arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : true] : []).filter(Boolean));

const channel = args.channel || 'stable';
let feedUrl = args.url;
if (!feedUrl){
  const cfg = JSON.parse(fs.readFileSync('desktop/update/config.json','utf8'));
  feedUrl = cfg.channels[channel];
}
const expectVersion = args['expect-version'];

async function main(){
  const r = await fetch(feedUrl);
  if (!r.ok) throw new Error(`Feed HTTP ${r.status}`);
  const j = await r.json();
  const okVersion = expectVersion ? (j.version === expectVersion) : true;
  const okChannel = j.channel === channel;
  const okUrl = typeof j.url === 'string' && j.url.includes('/artifacts/');
  const summary = { channel, feedUrl, version: j.version, artifact: j.url, okVersion, okChannel, okUrl };
  console.log(JSON.stringify(summary, null, 2));
  if (!(okVersion && okChannel && okUrl)) process.exit(2);
}
main().catch(e=>{ console.error(e); process.exit(1); });
