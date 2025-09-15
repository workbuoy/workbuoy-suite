// src/routes/_autoload.mount.auditverify.ts
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try { const mod = require(pathToServer); const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp; if (app && typeof app.use==='function') attach(app);} catch {}
}
const auditVerifyRouter = safe('../features/audit/audit.verify.router')?.default;
function safe(p:string){ try { return require(p); } catch { return null; } }
tryMount('../server', (app:any)=>{ if (auditVerifyRouter) app.use('/api', auditVerifyRouter); });
export {};
