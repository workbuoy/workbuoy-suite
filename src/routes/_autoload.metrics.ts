// src/routes/_autoload.metrics.ts
import { Router } from 'express';
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use==='function') attach(app);
  } catch {}
}
const router = Router();
router.get('/metrics', async (_req,res)=>{
  const mem = process.memoryUsage();
  const up = process.uptime();
  const metrics = [
    `process_uptime_seconds ${up}`,
    `process_rss_bytes ${mem.rss}`,
    `process_heap_bytes ${mem.heapUsed}`,
  ];
  res.type('text/plain').send(metrics.join('\n'));
});
tryMount('../server', (app:any)=> app.use(router));
export {};
