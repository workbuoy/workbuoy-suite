export type Provider = 'salesforce' | 'hubspot' | 'dynamics';

export interface ExternalContact { external_id: string; email?: string; name?: string; organization?: string; }
export interface ExternalOpportunity { external_id: string; title: string; value_cents?: number; currency?: string; stage?: string; pipeline?: string; }
export interface LocalContact { tenant_id: string; name: string; email?: string; organization_id?: string; }
export interface LocalOpportunity { tenant_id: string; title: string; value_cents?: number; currency?: string; pipeline_id: string; stage_id: string; }

export interface MappingResult<TLocal> {
  ok: boolean;
  local?: TLocal;
  error?: string;
}
