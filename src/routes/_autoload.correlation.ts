// src/routes/_autoload.correlation.ts
import { correlationHeader } from '../middleware/correlationHeader';
function tryMount(pathToServer: string, attach: (app:any)=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use==='function') attach(app);
  } catch {}
}
tryMount('../server', (app:any)=>{
  app.use(correlationHeader);
});
export {};
