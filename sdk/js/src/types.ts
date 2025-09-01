export type UUID = string;

export interface ListResult<T> {
  items: T[];
  next_cursor?: string | null;
}

export interface ClientOptions {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
  timeoutMs?: number;
}

export interface Contact {
  id?: UUID;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  owner_id?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface Pipeline {
  id?: UUID;
  tenant_id: string;
  name: string;
  description?: string;
  owner_id?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface Opportunity {
  id?: UUID;
  tenant_id: string;
  pipeline_id: string;
  stage_id: string;
  organization_id?: string;
  title: string;
  value_cents?: number;
  currency?: string;
  status?: 'open' | 'won' | 'lost';
  owner_id?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}
