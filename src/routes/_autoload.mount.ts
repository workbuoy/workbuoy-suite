// src/routes/_autoload.mount.ts
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use === 'function') attach(app);
  } catch {}
}
const { debugBusHandler } = require('./_debug.bus');
const addonsRouter = safeRequire('../features/addons/addons.router')?.default;
function safeRequire(p: string) { try { return require(p); } catch { return null; } }
tryMount('../server', (app:any) => {
  if (debugBusHandler) app.get('/_debug/bus', debugBusHandler);
  if (addonsRouter) app.use('/api', addonsRouter);
});
export {};
