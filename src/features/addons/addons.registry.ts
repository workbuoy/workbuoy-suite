// src/features/addons/addons.registry.ts
export type Addon = { key: string; title: string; enabled: boolean };
function getTenantFromReq(req:any): string { return req?.tenantId || req?.headers?.['x-tenant-id'] || 'default'; }
function flagsFor(_tenantId:string): Record<string, boolean> { return {}; }
const base: Omit<Addon,'enabled'>[] = [
  { key: 'crm.contacts', title: 'Contacts' },
  { key: 'tasks', title: 'Tasks' },
  { key: 'logs', title: 'Log Viewer' }
];
export function addonsForRequest(req:any): Addon[] {
  const flags = flagsFor(getTenantFromReq(req));
  return base.map(a => ({ ...a, enabled: Boolean(flags[a.key] ?? true) }));
}
