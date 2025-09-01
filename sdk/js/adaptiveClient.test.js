import http from 'http';
import { AdaptiveClient } from './adaptiveClient.js';

function startServer(schedule){
  // schedule: array of { durationMs, capacityQPS } phases
  let start = Date.now();
  let phaseIdx = 0;
  let tokens = schedule[0].capacityQPS;
  let lastRefill = Date.now();

  const server = http.createServer((req, res)=>{
    const now = Date.now();
    // move to next phase if time
    const elapsed = now - start;
    if (elapsed > schedule.slice(0, phaseIdx+1).reduce((a,b)=>a+b.durationMs,0) && phaseIdx < schedule.length-1){
      phaseIdx++;
      tokens = schedule[phaseIdx].capacityQPS;
      lastRefill = now;
    }

    // simple per-second token bucket for capacity
    const add = (now - lastRefill)/1000 * schedule[phaseIdx].capacityQPS;
    tokens = Math.min(schedule[phaseIdx].capacityQPS, tokens + add);
    lastRefill = now;

    if (tokens >= 1){
      tokens -= 1;
      res.writeHead(200, {'content-type':'text/plain'}); res.end('ok');
    } else {
      res.writeHead(429, {'retry-after':'0.2'}); res.end('slow');
    }
  });

  return new Promise(resolve=>{
    server.listen(0, ()=> resolve({ server, port: server.address().port }));
  });
}

jest.setTimeout(20000);

test('adaptive client lowers and raises QPS with 429s', async () => {
  const { server, port } = await startServer([
    { durationMs: 3000, capacityQPS: 3 },   // low capacity
    { durationMs: 3000, capacityQPS: 15 }   // higher capacity
  ]);

  const c = new AdaptiveClient({ maxQPS: 20, minQPS: 1, burst: 10, halfLifeMs: 500 });
  const endAt = Date.now() + 5500; // run across both phases
  let ok=0, r429=0;
  while (Date.now() < endAt){
    const res = await c.request(`http://127.0.0.1:${port}/`);
    if (res.status === 200) ok++; else if (res.status === 429) r429++;
  }
  const qpsAfterLow = c.targetQPS;

  // keep running into high phase to let it ramp up
  const t2 = Date.now()+2500;
  while (Date.now() < t2){
    const res = await c.request(`http://127.0.0.1:${port}/`);
    if (res.status === 200) ok++; else if (res.status === 429) r429++;
  }
  const qpsAfterHigh = c.targetQPS;

  server.close();

  expect(qpsAfterLow).toBeLessThan(8);      // should have backed off
  expect(qpsAfterHigh).toBeGreaterThan(qpsAfterLow); // should ramp up
  const errRate = r429 / Math.max(1, ok + r429);
  expect(errRate).toBeLessThan(0.2); // <20% after adaptation
});
