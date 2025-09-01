// scripts/perf/bench_scoring.js
// Simple HTTP benchmark harness for /api/score (or internal engine), using node: no external deps required
// Usage: node scripts/perf/bench_scoring.js

import http from 'http';

function now() { return Date.now(); }

async function runBatch(size=200, host='localhost', port=3000, path='/api/score/batch') {
  return new Promise((resolve, reject) => {
    const start = now();
    const req = http.request({ host, port, path, method: 'POST', headers: {'Content-Type':'application/json'}}, res => {
      let data=''; res.on('data', c => data+=c); res.on('end', () => {
        const dur = now()-start; resolve({status: res.statusCode, duration_ms: dur, bytes: data.length});
      });
    });
    req.on('error', reject);
    const signals = Array.from({length:size}).map((_,i)=>({ id: `s${i}`, type:'activity', entity_id:`e${i%50}`, created_at: new Date().toISOString() }));
    req.write(JSON.stringify({signals})); req.end();
  });
}

(async () => {
  const sizes = [200, 1000, 10000];
  const results = [];
  for (const s of sizes) {
    const r = await runBatch(s).catch(e=>({error:e.message}));
    results.push({ size: s, ...r });
  }
  console.table(results);
})();
