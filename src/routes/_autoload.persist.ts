// src/routes/_autoload.persist.ts
function tryRequire(p: string) { try { return require(p); } catch { return null; } }
const { selectRepo } = tryRequire('../core/persist/select') || {};

function rebindCrm() {
  const mod = tryRequire('../features/crm/crm.service');
  if (!mod || !selectRepo) return;
  const repo = selectRepo('crm_contacts');
  if (mod.setRepo) mod.setRepo(repo);
  if (mod.listContacts) mod.listContacts = () => repo.all();
  if (mod.upsertContact) mod.upsertContact = (c:any) => repo.upsert(c);
  if (mod.removeContact) mod.removeContact = (id:string) => repo.remove(id);
}

function rebindTasks() {
  const mod = tryRequire('../features/tasks/tasks.service');
  if (!mod || !selectRepo) return;
  const repo = selectRepo('tasks');
  if (mod.listTasks) mod.listTasks = () => repo.all();
  if (mod.upsertTask) mod.upsertTask = (t:any) => repo.upsert(t);
  if (mod.removeTask) mod.removeTask = (id:string) => repo.remove(id);
}

function rebindLogs() {
  const mod = tryRequire('../features/log/log.service') || tryRequire('../features/logs/logs.service');
  if (!mod || !selectRepo) return;
  const repo = selectRepo('logs');
  if (mod.listLogs) mod.listLogs = () => repo.all();
  if (mod.appendLog) mod.appendLog = (x:any) => repo.upsert(x);
  if (mod.clearLogs)  mod.clearLogs  = () => Promise.resolve(true);
}

function rebindDeals() {
  const mod = tryRequire('../features/deals/deals.service');
  if (!mod || !selectRepo) return;
  const repo = selectRepo('deals');
  if (mod.listDeals) mod.listDeals = () => repo.all();
  if (mod.upsertDeal) mod.upsertDeal = (d:any) => repo.upsert(d);
  if (mod.removeDeal) mod.removeDeal = (id:string) => repo.remove(id);
}

function tryMount(pathToServer: string, attach: ()=>void) {
  try {
    const mod = require(pathToServer);
    const app = mod?.default || mod?.app || mod?.server?.app || mod?.expressApp;
    if (app && typeof app.use === 'function') attach();
  } catch {}
}

tryMount('../server', () => {
  rebindCrm(); rebindTasks(); rebindLogs(); rebindDeals();
});
export {};
