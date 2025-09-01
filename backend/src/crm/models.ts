// Type-only view of CRM core entities for compile-time safety in PR A
export type UUID = string;

export interface BaseEntity {
  id: UUID;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  owner_id?: string | null;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface Pipeline extends BaseEntity {
  name: string;
  description?: string | null;
}

export interface Stage extends BaseEntity {
  pipeline_id: UUID;
  name: string;
  sort_index: number;
}

export interface Organization extends BaseEntity {
  name: string;
  website?: string | null;
  domain?: string | null;
}

export interface Contact extends BaseEntity {
  name: string;
  email?: string | null;
  phone?: string | null;
  organization_id?: UUID | null;
}

export interface Opportunity extends BaseEntity {
  pipeline_id: UUID;
  stage_id: UUID;
  organization_id?: UUID | null;
  title: string;
  value_cents?: number | null;
  currency?: string | null; // ISO 4217
  status?: 'open' | 'won' | 'lost';
}

export interface OpportunityContactLink {
  tenant_id: string;
  opportunity_id: UUID;
  contact_id: UUID;
  role?: string | null;
  created_at: string;
}