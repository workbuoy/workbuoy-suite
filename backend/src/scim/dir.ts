export type ScimUser = {
  id: string;
  userName: string;
  name?: { givenName?: string; familyName?: string; formatted?: string };
  displayName?: string;
  active?: boolean;
  emails?: { value: string; primary?: boolean; type?: string }[];
  groups?: { value: string; display?: string }[];
  tenant_id: string;
  meta?: { created: string; lastModified: string; resourceType: 'User' };
};

export type ScimGroup = {
  id: string;
  displayName: string;
  members?: { value: string; display?: string }[];
  tenant_id: string;
  meta?: { created: string; lastModified: string; resourceType: 'Group' };
};

type Store = { users: ScimUser[]; groups: ScimGroup[]; };
const byTenant = new Map<string, Store>();

export function store(tenant: string): Store {
  if (!byTenant.has(tenant)) byTenant.set(tenant, { users: [], groups: [] });
  return byTenant.get(tenant)!;
}

export function nowIso(){ return new Date().toISOString(); }
