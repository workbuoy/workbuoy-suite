// src/routes/_autoload.audit.ts
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use==='function') attach(app);
  } catch {}
}
const auditRouter = safe('../features/audit/audit.router')?.default;
function safe(p:string){ try { return require(p); } catch { return null; } }
tryMount('../server', (app:any)=>{ if (auditRouter) app.use('/api', auditRouter); });
export {};
