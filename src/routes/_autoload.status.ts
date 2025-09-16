// src/routes/_autoload.status.ts
import { Router } from 'express';
import { selectRepo } from '../core/persist/select';
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use==='function') attach(app);
  } catch {}
}
const router = Router();
router.get('/status', async (_req,res)=>{
  const mode = process.env.PERSIST_MODE || 'file';
  res.json({ ok:true, mode, ts: Date.now() });
});
tryMount('../server', (app:any)=> app.use(router));
export {};
