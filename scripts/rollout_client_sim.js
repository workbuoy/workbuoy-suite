// Simulate N clients requesting update feed under a rollout policy.
const args = Object.fromEntries(process.argv.slice(2).map((a,i,arr)=> a.startsWith('--') ? [a.replace(/^--/,''), arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : true] : []).filter(Boolean));
const N = Number(args.n || 10);
const channel = args.channel || 'stable';
const url = args.url || `http://127.0.0.1:45910/feed/${channel}/latest.json`;

function randOS(i){ return ['windows','mac','linux'][i%3]; }
async function probe(i){
  const headers = {
    'x-client-id': 'client-'+i,
    'x-os': randOS(i),
    'x-current-version': args['current'] || '1.0.0'
  };
  const r = await fetch(url, { headers });
  const ok = r.status === 200;
  const body = ok ? await r.json() : null;
  return { ok, status: r.status, version: body?.version, reason: !ok ? 'no_update' : 'update' };
}

async function main(){
  let got=0; let failed=0; const results=[];
  for (let i=0;i<N;i++){ const r = await probe(i); results.push(r); if (r.ok) got++; }
  const rate = got / N;
  console.log(JSON.stringify({ channel, clients:N, updates:got, rate, results }, null, 2));
  if (channel==='stable'){
    // Expect around policy percent (~0.3). With small N allow wide band 0.1..0.6
    if (!(rate >= 0.1 && rate <= 0.6)) process.exit(2);
  } else {
    if (!(rate > 0.8)) process.exit(2);
  }
}
main().catch(e=>{ console.error(e); process.exit(1); });
