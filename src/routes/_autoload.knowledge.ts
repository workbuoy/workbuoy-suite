// src/routes/_autoload.knowledge.ts
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use==='function') attach(app);
  } catch {}
}

const router = require('./knowledge.router')?.default;
tryMount('../server', (app:any)=>{ if (router) app.use('/api', router); });

export {};
