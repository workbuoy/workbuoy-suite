import { ExternalContact, ExternalOpportunity, MappingResult, LocalContact, LocalOpportunity } from './types.js';

export function mapExternalContactToLocal(row: ExternalContact, tenant_id: string): MappingResult<LocalContact> {
  if (!row.name && !row.email) return { ok: false, error: 'missing name/email' };
  return { ok: true, local: { tenant_id, name: row.name || row.email || 'Unnamed', email: row.email } };
}

export function mapExternalOpportunityToLocal(row: ExternalOpportunity, tenant_id: string, ids: { pipeline_id: string; stage_id: string }): MappingResult<LocalOpportunity> {
  if (!row.title) return { ok: false, error: 'missing title' };
  return { ok: true, local: { tenant_id, title: row.title, value_cents: row.value_cents, currency: row.currency, pipeline_id: ids.pipeline_id, stage_id: ids.stage_id } };
}
