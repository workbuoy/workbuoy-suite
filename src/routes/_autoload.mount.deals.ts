// src/routes/_autoload.mount.deals.ts
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try { const mod = require(pathToServer); const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp; if (app && typeof app.use==='function') attach(app);} catch {}
}
const dealsRouter = safe('../features/deals/deals.router')?.default;
function safe(p:string){ try { return require(p); } catch { return null; } }
tryMount('../server', (app:any)=>{ if (dealsRouter) app.use('/api', dealsRouter); });
export {};
