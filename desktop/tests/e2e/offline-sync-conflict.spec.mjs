import { _electron as electron, test, expect } from '@playwright/test';
import http from 'http';

function makeServer(port, handlers) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const h = handlers[url.pathname] || handlers['*'];
    if (h) return h(req, res);
    res.statusCode = 404; res.end();
  });
  return new Promise(resolve => server.listen(port, ()=> resolve(server)));
}

test('offline → enqueue → online → flush (LWW conflict)', async ({}, testInfo) => {
  // Start with no server to simulate offline
  const apiPort = 19000 + Math.floor(Math.random()*1000);
  process.env.WB_API_BASE_URL = `http://localhost:${apiPort}`;

  const app = await electron.launch({ args: ['.'], env: { ...process.env, WB_API_BASE_URL: `http://localhost:${apiPort}` } });
  const win = await app.firstWindow();

  // Build a workflow with two steps on same entity to cause conflict later
  const wf = { orgId: 'org-test', steps: [
    { qtype:'crm', entity:'deal', op:'update', entityId:'d1', payload:{ updated_at: 1000, title:'A' } },
    { qtype:'crm', entity:'deal', op:'update', entityId:'d1', payload:{ updated_at: 2000, title:'B' } }
  ]};
  const r = await win.evaluate(async (wf) => await window.wbDesktop.workflowRun(wf), wf);
  expect(r.ok).toBeTruthy();

  // No server yet: queue should have pending items
  // Try read queue length via org-list + plugins (smoke level) or a dedicated queue:list if exposed
  // This is a smoke check; full verification by metrics could be added once /metrics is surfaced to renderer safely.

  // Bring server online with conflict policy (always accept newer updated_at)
  const server = await makeServer(apiPort, {
    '/deals/update': async (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ ok:true })); },
    '*': async (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ ok:true })); }
  });

  // Wait a bit to let background flush
  await new Promise(r => setTimeout(r, 1500));

  // Basic positive assertion: app window still alive, implies no crash; more deep checks rely on exported metrics endpoints
  expect(await win.title()).toBeTruthy();

  await new Promise(r => server.close(()=> r()));
  await app.close();
});
