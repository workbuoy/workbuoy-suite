export type ProviderName = 'hubspot'|'salesforce'|'dynamics';

export interface ConnectorConfig {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  apiBase?: string;
}

export interface Job {
  id: string;
  provider: ProviderName;
  tenant_id: string;
  type: 'contact'|'opportunity';
  payload: any;
  attempt: number;
  ts: number;
}
