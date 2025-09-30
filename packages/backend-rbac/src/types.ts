import type { Request } from 'express';

export type Role = 'admin' | 'manager' | 'contributor' | 'viewer' | 'deny';
export type ResourceKind = 'pipeline' | 'record' | 'org';
export type Action = 'read' | 'create' | 'update' | 'delete';

export interface RoleBinding {
  id: string;
  tenant_id: string;
  user_id?: string | null;
  group?: string | null;
  role: Role;
  effect?: 'allow' | 'deny';
  resource?: { kind: ResourceKind; id?: string | null };
  created_at: number;
}

export interface Subject {
  tenant_id: string;
  user_id?: string | null;
  groups?: string[];
  roles?: Role[];
}

export interface Decision {
  allow: boolean;
  reason: string;
  binding?: RoleBinding | null;
}

export interface Store {
  listBindings(tenant_id: string): Promise<RoleBinding[]>;
  upsert(binding: Omit<RoleBinding, 'id' | 'created_at'> & { id?: string }): Promise<RoleBinding>;
  delete(id: string, tenant_id: string): Promise<boolean>;
}

export interface ResourceDescriptor {
  id?: string | null;
  owner_id?: string | null;
}

export type ResourceResolver =
  | ResourceDescriptor
  | ((req: Request) => Promise<ResourceDescriptor | void> | ResourceDescriptor | void);

export interface CounterLike {
  inc(value?: number): void;
}

export interface AuditEvent {
  type: string;
  tenant_id: string;
  actor_id: string | null;
  details?: Record<string, unknown>;
}

export interface RbacConfiguration {
  enforce?: boolean;
  store?: Store;
  counters?: Partial<{
    denied: CounterLike;
    policyChange: CounterLike;
  }>;
  audit?: ((event: AuditEvent) => void | Promise<void>) | null;
}

export interface Binding {
  tenant_id: string;
  group: string;
  role: Exclude<Role, 'deny'>;
  resource?: { kind: ResourceKind; id?: string };
}

export interface PolicyRule {
  action: Action;
  resource: ResourceKind;
  role: Role;
}
