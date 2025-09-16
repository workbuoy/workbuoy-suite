// src/routes/_autoload.legacy-warning.ts
import fs from 'fs';
import path from 'path';

function tryMount(pathToServer: string, attach: ()=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use==='function') attach();
  } catch {}
}

tryMount('../server', ()=>{
  const root = path.resolve(__dirname, '..');
  const candidates = ['contacts.route.ts','tasks.route.ts','log.route.ts'];
  for (const c of candidates) {
    try {
      const matches:string[] = [];
      (function scan(dir:string){
        for (const f of fs.readdirSync(dir)) {
          const p = path.join(dir,f);
          const st = fs.statSync(p);
          if (st.isDirectory()) scan(p);
          else if (f===c && !p.includes('_legacy')) matches.push(p);
        }
      })(root);
      if (matches.length) {
        // eslint-disable-next-line no-console
        console.warn('[legacy-warning]', c, 'present at', matches);
      }
    } catch {}
  }
});

export {};
