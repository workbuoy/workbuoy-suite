// src/routes/_autoload.persist.adopt.ts
// Rebind CRM/Tasks/Logs/Deals services to selectRepo<T> if available, otherwise no-op.
function tryRequire(p:string){ try { return require(p); } catch { return null; } }
const { selectRepo } = tryRequire('../core/persist/select') || {};

function adopt(servicePath:string, table:string, patterns: { list?: string[], upsert?: string[], remove?: string[] }){
  const mod = tryRequire(servicePath); if (!mod || !selectRepo) return;
  const repo = selectRepo(table);
  if ((mod as any).setRepo) { (mod as any).setRepo(repo); return; }
  const { list=[], upsert=[], remove=[] } = patterns;
  for (const m of list)   if (typeof (mod as any)[m] === 'function') (mod as any)[m] = () => repo.all();
  for (const m of upsert) if (typeof (mod as any)[m] === 'function') (mod as any)[m] = (x:any) => repo.upsert(x);
  for (const m of remove) if (typeof (mod as any)[m] === 'function') (mod as any)[m] = (id:string) => repo.remove(id);
}

(function run(){
  adopt('../features/crm/crm.service',   'crm_contacts', { list:['listContacts'], upsert:['upsertContact'], remove:['removeContact'] });
  adopt('../features/tasks/tasks.service','tasks',        { list:['listTasks'],    upsert:['upsertTask'],    remove:['removeTask','deleteTask'] });
  adopt('../features/log/log.service',   'logs',         { list:['listLogs'],     upsert:['appendLog','upsertLog'], remove:['removeLog','clearLogs'] });
  adopt('../features/deals/deals.service','deals',       { list:['listDeals'],    upsert:['upsertDeal'],     remove:['removeDeal','deleteDeal'] });
})();

export {};
